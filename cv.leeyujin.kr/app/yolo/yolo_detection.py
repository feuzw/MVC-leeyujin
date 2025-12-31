"""
YOLO를 사용하여 data/yolo 폴더의 이미지들을 detection
"""
from ultralytics import YOLO
import cv2
from pathlib import Path
import os
import sys

def detect_images_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지를 YOLO로 detection
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # 모델 로드 (YOLOv11)
    print("YOLOv11 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n.pt"
    
    if not model_path.exists():
        print(f"✗ 모델 파일을 찾을 수 없습니다: {model_path}")
        return
    
    model = YOLO(str(model_path))
    print("✓ YOLOv11 모델 로드 완료")
    
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
        # 폴더 내 모든 이미지 파일 찾기
        image_files = [
            f for f in image_dir.iterdir()
            if f.is_file() and f.suffix.lower() in image_extensions
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 detection 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        try:
            # YOLO detection 수행
            results = model.predict(
                source=str(image_path),
                conf=0.25,  # confidence threshold
                save=False,  # 자동 저장하지 않음
                show=False,  # 자동 표시하지 않음
            )
            
            # 결과 가져오기
            result = results[0]
            
            # detection 결과 정보 출력
            if len(result.boxes) > 0:
                print(f"  ✓ {len(result.boxes)}개의 객체를 감지했습니다:")
                
                # 각 detection 결과 출력
                for box in result.boxes:
                    cls_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    class_name = model.names[cls_id]
                    print(f"    - {class_name}: {confidence:.2%}")
            else:
                print("  - 감지된 객체가 없습니다.")
            
            # 결과 이미지 생성 (bounding box 그려진 이미지)
            annotated_image = result.plot()
            
            # 결과 이미지 저장 (data/yolo 폴더에 저장)
            output_dir = image_dir / "detected"
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"detected_{image_path.name}"
            cv2.imwrite(str(output_path), annotated_image)
            print(f"  ✓ 결과 이미지 저장: {output_path}")
            
            # 결과 이미지 표시 (선택사항)
            # cv2.imshow(f"Detection Result - {image_path.name}", annotated_image)
            # cv2.waitKey(0)
            # cv2.destroyAllWindows()
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    detect_images_in_folder(target_filename)

