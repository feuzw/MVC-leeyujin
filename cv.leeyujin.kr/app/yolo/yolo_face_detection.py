"""
YOLOv8-face-lindevs 모델을 사용하여 data/yolo 폴더의 이미지들에서 얼굴만 detection
"""
from ultralytics import YOLO
import cv2
from pathlib import Path
import sys

def detect_faces_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지에서 얼굴만 detection
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # YOLOv8-face-lindevs 모델 로드
    print("YOLOv8-face-lindevs 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolov8n-face-lindevs.pt"
    
    if not model_path.exists():
        print(f"✗ 모델 파일을 찾을 수 없습니다: {model_path}")
        return
    
    model = YOLO(str(model_path))
    print("✓ YOLOv8-face-lindevs 모델 로드 완료")
    
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
            and 'detected' not in str(f) and 'face_' not in str(f)
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 얼굴 detection 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        try:
            # YOLO 얼굴 detection 수행
            results = model.predict(
                source=str(image_path),
                conf=0.25,  # confidence threshold
                save=False,
                show=False,
            )
            
            # 결과 가져오기
            result = results[0]
            
            # 결과 이미지 생성 (얼굴만 표시)
            annotated_image = result.plot()
            
            # 얼굴 detection 결과 정보 출력
            face_count = len(result.boxes)
            if face_count > 0:
                print(f"  ✓ {face_count}개의 얼굴을 감지했습니다:")
                
                # 각 얼굴 detection 결과 출력
                for i, box in enumerate(result.boxes, 1):
                    x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                    conf = float(box.conf[0])
                    cls_id = int(box.cls[0])
                    cls_name = model.names[cls_id] if cls_id in model.names else "face"
                    print(f"    - Face {i}: {conf:.2%} ({cls_name})")
            else:
                print("  - 감지된 얼굴이 없습니다.")
            
            # 결과 이미지 저장 (data/yolo 폴더에 저장)
            output_dir = image_dir / "detected"
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"face_detected_{image_path.name}"
            cv2.imwrite(str(output_path), annotated_image)
            print(f"  ✓ 결과 이미지 저장: {output_path}")
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"얼굴 detection 결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    detect_faces_in_folder(target_filename)
