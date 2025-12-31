"""
YOLO segmentation 모델을 사용하여 data/yolo 폴더의 이미지들에서 얼굴만 segmentation 수행
"""
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
import sys

def segment_faces_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지에서 얼굴만 segmentation 수행
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # 얼굴 detection 모델 로드 (얼굴 위치 찾기용)
    print("얼굴 detection 모델 로드 중...")
    face_model_path = Path(__file__).parent.parent / "data" / "model" / "yolov8n-face-lindevs.pt"
    
    if not face_model_path.exists():
        print(f"✗ 얼굴 detection 모델 파일을 찾을 수 없습니다: {face_model_path}")
        return
    
    face_model = YOLO(str(face_model_path))
    print("✓ 얼굴 detection 모델 로드 완료")
    
    # YOLO segmentation 모델 로드 (person segmentation용)
    print("YOLO segmentation 모델 로드 중...")
    seg_model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n-seg.pt"
    
    # 모델 파일이 없으면 자동 다운로드 시도
    if not seg_model_path.exists():
        print(f"⚠ 모델 파일을 찾을 수 없습니다: {seg_model_path}")
        print("YOLOv11n-seg 모델을 자동 다운로드합니다...")
        seg_model = YOLO("yolo11n-seg")  # 자동 다운로드
    else:
        seg_model = YOLO(str(seg_model_path))
    
    print("✓ YOLO segmentation 모델 로드 완료")
    
    # 이미지 폴더 경로
    image_dir = Path(__file__).parent.parent / "data" / "yolo"
    
    if not image_dir.exists():
        print(f"✗ 이미지 폴더를 찾을 수 없습니다: {image_dir}")
        return
    
    # 지원하는 이미지 확장자
    image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    # 특정 파일만 처리하거나 모든 파일 처리
    if target_filename:
        # 특정 파일만 처리
        target_path = image_dir / target_filename
        if target_path.exists() and target_path.is_file() and target_path.suffix.lower() in image_extensions:
            image_files = [target_path]
            print(f"\n✓ 특정 파일 처리: {target_filename}\n")
        else:
            print(f"✗ 파일을 찾을 수 없습니다: {target_filename}")
            return
    else:
        # 폴더 내 모든 이미지 파일 찾기 (detected 폴더 제외)
        image_files = [
            f for f in image_dir.iterdir()
            if f.is_file() and f.suffix.lower() in image_extensions
            and 'detected' not in str(f) and 'face_' not in str(f) and 'segmented' not in str(f)
            and 'object_segmented' not in str(f)
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 얼굴 segmentation 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        # 결과 이미지 변수 초기화 (에러 발생 시에도 저장하기 위해)
        segmented_image = None
        face_count = 0
        
        try:
            # 원본 이미지 로드
            original_image = cv2.imread(str(image_path))
            if original_image is None:
                print(f"  ✗ 이미지를 읽을 수 없습니다: {image_path}")
                continue
            
            h, w = original_image.shape[:2]
            
            # 1단계: 얼굴 detection 수행 (얼굴 위치 찾기)
            face_results = face_model.predict(
                source=str(image_path),
                conf=0.25,
                save=False,
                show=False,
            )
            face_result = face_results[0]
            face_boxes = face_result.boxes
            
            if len(face_boxes) == 0:
                print("  - 감지된 얼굴이 없습니다.")
                # 얼굴이 없어도 원본 이미지 저장
                segmented_image = original_image.copy()
                face_count = 0
            else:
                # 2단계: Person segmentation 수행 (얼굴 영역의 segmentation 마스크 추출용)
                seg_results = seg_model.predict(
                    source=str(image_path),
                    conf=0.25,
                    save=False,
                    show=False,
                )
                seg_result = seg_results[0]
                
                # 원본 이미지 복사 (결과 이미지용)
                segmented_image = original_image.copy()
                
                # 얼굴 영역만 segmentation 마스크 추출
                face_count = 0
                
                # Person segmentation 마스크가 있는 경우
                if seg_result.masks is not None and len(seg_result.masks) > 0:
                    seg_masks = seg_result.masks.data.cpu().numpy()
                    seg_boxes = seg_result.boxes
                    
                    # 각 얼굴에 대해 해당하는 person segmentation 마스크 찾기
                    for face_box in face_boxes:
                        face_x1, face_y1, face_x2, face_y2 = face_box.xyxy[0].cpu().numpy().astype(int)
                        face_center_x = (face_x1 + face_x2) / 2
                        face_center_y = (face_y1 + face_y2) / 2
                        face_conf = float(face_box.conf[0])
                        
                        # 얼굴 중심점이 포함된 person segmentation 마스크 찾기
                        best_mask = None
                        best_iou = 0
                        
                        for seg_box, seg_mask in zip(seg_boxes, seg_masks):
                            # cls가 None일 수 있으므로 안전하게 처리
                            if seg_box.cls is None or len(seg_box.cls) == 0:
                                continue
                            cls_id = int(seg_box.cls[0])
                            cls_name = seg_model.names[cls_id] if cls_id in seg_model.names else "unknown"
                            
                            # person 클래스만 처리
                            if cls_name.lower() == 'person':
                                seg_x1, seg_y1, seg_x2, seg_y2 = seg_box.xyxy[0].cpu().numpy().astype(int)
                                
                                # 얼굴 중심점이 person 박스 안에 있는지 확인
                                if seg_x1 <= face_center_x <= seg_x2 and seg_y1 <= face_center_y <= seg_y2:
                                    # 얼굴 박스와 person 박스의 IoU 계산
                                    inter_x1 = max(face_x1, seg_x1)
                                    inter_y1 = max(face_y1, seg_y1)
                                    inter_x2 = min(face_x2, seg_x2)
                                    inter_y2 = min(face_y2, seg_y2)
                                    
                                    if inter_x2 > inter_x1 and inter_y2 > inter_y1:
                                        inter_area = (inter_x2 - inter_x1) * (inter_y2 - inter_y1)
                                        face_area = (face_x2 - face_x1) * (face_y2 - face_y1)
                                        seg_area = (seg_x2 - seg_x1) * (seg_y2 - seg_y1)
                                        union_area = face_area + seg_area - inter_area
                                        iou = inter_area / union_area if union_area > 0 else 0
                                        
                                        if iou > best_iou:
                                            best_iou = iou
                                            best_mask = seg_mask
                        
                        # 얼굴 영역만 마스크 추출
                        if best_mask is not None:
                            face_count += 1
                            
                            # 마스크를 원본 이미지 크기로 리사이즈
                            mask_resized = cv2.resize(best_mask, (w, h), interpolation=cv2.INTER_NEAREST)
                            
                            # 얼굴 bounding box 영역만 마스크 적용
                            face_mask = np.zeros((h, w), dtype=np.float32)
                            face_mask[face_y1:face_y2, face_x1:face_x2] = mask_resized[face_y1:face_y2, face_x1:face_x2]
                            
                            # 파란색 마스크 생성 (얼굴)
                            color_mask = np.zeros_like(original_image)
                            color_mask[:, :, 0] = (face_mask * 255).astype(np.uint8)  # 파란색
                            
                            # 마스크를 원본 이미지에 오버레이
                            mask_bool = face_mask > 0.3
                            segmented_image[mask_bool] = cv2.addWeighted(
                                segmented_image[mask_bool], 0.6,
                                color_mask[mask_bool], 0.4, 0
                            )
                            
                            # 얼굴 Bounding box 그리기
                            color = (255, 0, 0)  # 파란색
                            cv2.rectangle(segmented_image, (face_x1, face_y1), (face_x2, face_y2), color, 2)
                            
                            # 라벨 추가
                            label = f"Face {face_conf:.2f}"
                            cv2.putText(segmented_image, label, (face_x1, face_y1 - 10),
                                      cv2.FONT_HERSHEY_SIMPLEX, 0.5, color, 2)
                
                print(f"  ✓ {face_count}개의 얼굴을 segmentation했습니다.")
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
            # 에러 발생 시에도 원본 이미지라도 저장
            if segmented_image is None:
                try:
                    original_image = cv2.imread(str(image_path))
                    if original_image is not None:
                        segmented_image = original_image.copy()
                        print("  ⚠ 에러 발생으로 원본 이미지를 저장합니다.")
                except:
                    pass
        
        # 결과 이미지 저장 (에러가 발생해도 저장 시도)
        if segmented_image is not None:
            try:
                output_dir = image_dir / "detected"
                output_dir.mkdir(exist_ok=True)
                output_path = output_dir / f"face_segmented_{image_path.name}"
                
                # 이미지 저장
                success = cv2.imwrite(str(output_path), segmented_image)
                if success:
                    print(f"  ✓ 결과 이미지 저장: {output_path}")
                else:
                    print(f"  ✗ 결과 이미지 저장 실패: {output_path}")
            except Exception as e:
                print(f"  ✗ 파일 저장 중 오류 발생: {e}")
        else:
            print(f"  ✗ 저장할 이미지가 없습니다.")
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"얼굴 segmentation 결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    segment_faces_in_folder(target_filename)

