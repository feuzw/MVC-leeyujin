"""
YOLO segmentation 모델을 사용하여 data/yolo 폴더의 이미지들에서 객체 segmentation 수행
"""
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
import sys

def segment_objects_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지에서 객체 segmentation 수행
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # YOLO segmentation 모델 로드 (YOLOv11-seg 또는 YOLOv8-seg)
    print("YOLO segmentation 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n-seg.pt"
    
    # 모델 파일이 없으면 자동 다운로드 시도
    if not model_path.exists():
        print(f"⚠ 모델 파일을 찾을 수 없습니다: {model_path}")
        print("YOLOv11n-seg 모델을 자동 다운로드합니다...")
        model = YOLO("yolo11n-seg")  # 자동 다운로드
    else:
        model = YOLO(str(model_path))
    
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
            and 'face_segmented' not in str(f)
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 객체 segmentation 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        try:
            # 원본 이미지 로드
            original_image = cv2.imread(str(image_path))
            if original_image is None:
                print(f"  ✗ 이미지를 읽을 수 없습니다: {image_path}")
                continue
            
            # YOLO segmentation 수행
            results = model.predict(
                source=str(image_path),
                conf=0.25,  # confidence threshold
                save=False,
                show=False,
            )
            
            # 결과 가져오기
            result = results[0]
            
            # 원본 이미지 복사 (결과 이미지용)
            segmented_image = original_image.copy()
            
            # 객체 detection 및 segmentation 결과 처리
            object_count = 0
            class_counts = {}
            
            if result.masks is not None and len(result.masks) > 0:
                # Segmentation 마스크가 있는 경우
                masks = result.masks.data.cpu().numpy()
                boxes = result.boxes
                
                # 클래스별 색상 매핑 (BGR 형식)
                class_colors = {
                    'person': (0, 255, 0),      # 초록색
                    'car': (255, 0, 0),          # 파란색
                    'bicycle': (0, 255, 255),    # 노란색
                    'motorcycle': (255, 0, 255), # 마젠타
                    'bus': (255, 165, 0),        # 주황색
                    'truck': (0, 0, 255),        # 빨간색
                }
                
                for i, (box, mask) in enumerate(zip(boxes, masks)):
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    cls_name = model.names[cls_id] if cls_id in model.names else "unknown"
                    
                    object_count += 1
                    class_counts[cls_name] = class_counts.get(cls_name, 0) + 1
                    
                    # 마스크를 원본 이미지 크기로 리사이즈
                    h, w = original_image.shape[:2]
                    mask_resized = cv2.resize(mask, (w, h), interpolation=cv2.INTER_NEAREST)
                    
                    # 클래스별 색상 가져오기 (기본값: 흰색)
                    color = class_colors.get(cls_name.lower(), (255, 255, 255))
                    
                    # 컬러 마스크 생성
                    mask_normalized = mask_resized.astype(np.float32)
                    color_mask = np.zeros_like(original_image)
                    color_mask[:, :, 0] = (mask_normalized * color[0]).astype(np.uint8)
                    color_mask[:, :, 1] = (mask_normalized * color[1]).astype(np.uint8)
                    color_mask[:, :, 2] = (mask_normalized * color[2]).astype(np.uint8)
                    
                    # 마스크를 원본 이미지에 오버레이
                    mask_bool = mask_resized > 0.5
                    segmented_image[mask_bool] = cv2.addWeighted(
                        segmented_image[mask_bool], 0.6,
                        color_mask[mask_bool], 0.4, 0
                    )
                    
                    # Bounding box 그리기
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    cv2.rectangle(segmented_image, (x1, y1), (x2, y2), color, 2)
                    
                    # 라벨 추가
                    label = f"{cls_name} {conf:.2f}"
                    # 라벨 배경 그리기
                    (label_width, label_height), baseline = cv2.getTextSize(
                        label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 2
                    )
                    cv2.rectangle(
                        segmented_image,
                        (x1, y1 - label_height - baseline - 5),
                        (x1 + label_width, y1),
                        color,
                        -1
                    )
                    cv2.putText(
                        segmented_image,
                        label,
                        (x1, y1 - 5),
                        cv2.FONT_HERSHEY_SIMPLEX,
                        0.5,
                        (255, 255, 255),  # 흰색 텍스트
                        2
                    )
                
                # 결과 요약 출력
                print(f"  ✓ {object_count}개의 객체를 segmentation했습니다:")
                for cls_name, count in sorted(class_counts.items()):
                    print(f"    - {cls_name}: {count}개")
            else:
                # Segmentation 마스크가 없는 경우 (detection만 수행)
                if len(result.boxes) > 0:
                    print(f"  ⚠ {len(result.boxes)}개의 객체를 감지했지만 segmentation 마스크가 없습니다.")
                    # Detection 결과만 표시
                    annotated_image = result.plot()
                    segmented_image = annotated_image
                else:
                    print("  - 감지된 객체가 없습니다.")
            
            # 결과 이미지 저장
            output_dir = image_dir / "detected"
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"segmented_{image_path.name}"
            cv2.imwrite(str(output_path), segmented_image)
            print(f"  ✓ 결과 이미지 저장: {output_path}")
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"객체 segmentation 결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    segment_objects_in_folder(target_filename)

