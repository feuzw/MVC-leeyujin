"""
YOLO 설치 확인 및 데모
"""
from ultralytics import YOLO
import cv2
from pathlib import Path

if __name__ == "__main__":
    # 모델 로드 (YOLOv11)
    print("YOLOv11 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n.pt"
    
    if not model_path.exists():
        print(f"✗ 모델 파일을 찾을 수 없습니다: {model_path}")
        exit(1)
    
    model = YOLO(str(model_path))  # YOLOv11 nano 모델
    print("✓ YOLOv11 모델 로드 완료")
    
    # 스크립트 위치 기준으로 이미지 경로 찾기
    script_dir = Path(__file__).parent.parent.parent  # app/yolo -> app -> 프로젝트 루트
    image_path = None
    
    # 샘플 이미지 찾기
    sample_images = [
        script_dir / "app" / "data" / "opencv" / "lena.jpg",
        script_dir / "app" / "data" / "opencv" / "cat.jpg",
        script_dir / "app" / "data" / "opencv" / "girl.jpg",
    ]
    
    for img_path in sample_images:
        if img_path.exists():
            image_path = str(img_path)
            print(f"이미지 찾음: {image_path}")
            break
    
    # 추론 및 결과 표시
    if image_path:
        print(f"이미지 추론 중...")
        results = model.predict(image_path, show=False)
        annotated = results[0].plot()
        cv2.imshow("YOLO Result", annotated)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    else:
        print("샘플 이미지를 찾을 수 없습니다.")
        print(f"검색 경로: {script_dir / 'app' / 'data' / 'opencv'}")