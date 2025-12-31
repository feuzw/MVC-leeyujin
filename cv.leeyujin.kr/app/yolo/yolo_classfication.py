"""
YOLO classification 모델을 사용하여 data/yolo 폴더의 이미지들을 classification 수행
"""
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
import sys

def classify_images_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지를 YOLO로 classification
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # YOLO classification 모델 로드 (YOLOv11-cls 또는 YOLOv8-cls)
    print("YOLO classification 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n-cls.pt"
    
    # 모델 파일이 없으면 자동 다운로드 시도
    if not model_path.exists():
        print(f"⚠ 모델 파일을 찾을 수 없습니다: {model_path}")
        print("YOLOv11n-cls 모델을 자동 다운로드합니다...")
        model = YOLO("yolo11n-cls")  # 자동 다운로드
    else:
        model = YOLO(str(model_path))
    
    print("✓ YOLO classification 모델 로드 완료")
    
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
            and 'face_segmented' not in str(f) and 'pose_' not in str(f) and 'classified' not in str(f)
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 classification 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        try:
            # 원본 이미지 로드
            original_image = cv2.imread(str(image_path))
            if original_image is None:
                print(f"  ✗ 이미지를 읽을 수 없습니다: {image_path}")
                continue
            
            h, w = original_image.shape[:2]
            
            # YOLO classification 수행
            results = model.predict(
                source=str(image_path),
                save=False,
                show=False,
            )
            
            # 결과 가져오기
            result = results[0]
            
            # 원본 이미지 복사 (결과 이미지용)
            classified_image = original_image.copy()
            
            # Classification 결과 처리
            if result.probs is not None:
                # 상위 5개 클래스 가져오기
                top5_probs = result.probs.top5
                top5_conf = result.probs.top5conf.cpu().numpy()
                
                # 클래스 이름 가져오기
                class_names = result.names
                
                print(f"  ✓ Classification 결과 (상위 5개):")
                
                # 이미지에 결과 표시
                y_offset = 30
                font = cv2.FONT_HERSHEY_SIMPLEX
                font_scale = 0.7
                thickness = 2
                
                # 배경 박스 그리기
                text_height = 25
                bg_height = len(top5_probs) * text_height + 20
                cv2.rectangle(classified_image, (10, 10), (400, bg_height), (0, 0, 0), -1)
                cv2.rectangle(classified_image, (10, 10), (400, bg_height), (255, 255, 255), 2)
                
                # 상위 5개 클래스 표시
                for i, (class_id, conf) in enumerate(zip(top5_probs, top5_conf)):
                    class_name = class_names[class_id]
                    conf_percent = conf * 100
                    
                    # 상위 1개는 다른 색상으로 강조
                    if i == 0:
                        color = (0, 255, 0)  # 초록색
                        prefix = "🥇"
                    else:
                        color = (255, 255, 255)  # 흰색
                        prefix = f"{i+1}."
                    
                    text = f"{prefix} {class_name}: {conf_percent:.2f}%"
                    print(f"    {text}")
                    
                    # 텍스트 그리기
                    cv2.putText(
                        classified_image,
                        text,
                        (15, y_offset),
                        font,
                        font_scale,
                        color,
                        thickness
                    )
                    y_offset += text_height
                
                # 가장 높은 confidence 클래스를 제목으로 표시
                top_class_id = top5_probs[0]
                top_class_name = class_names[top_class_id]
                top_conf = top5_conf[0] * 100
                
                # 이미지 하단에 메인 클래스 표시
                main_text = f"Class: {top_class_name} ({top_conf:.1f}%)"
                text_size = cv2.getTextSize(main_text, font, 1.0, thickness)[0]
                text_x = (w - text_size[0]) // 2
                text_y = h - 20
                
                # 배경 박스
                cv2.rectangle(
                    classified_image,
                    (text_x - 10, text_y - text_size[1] - 10),
                    (text_x + text_size[0] + 10, text_y + 10),
                    (0, 0, 0),
                    -1
                )
                cv2.rectangle(
                    classified_image,
                    (text_x - 10, text_y - text_size[1] - 10),
                    (text_x + text_size[0] + 10, text_y + 10),
                    (0, 255, 0),
                    2
                )
                
                # 텍스트
                cv2.putText(
                    classified_image,
                    main_text,
                    (text_x, text_y),
                    font,
                    1.0,
                    (0, 255, 0),
                    thickness
                )
            else:
                print("  - Classification 결과가 없습니다.")
            
            # 결과 이미지 저장
            output_dir = image_dir / "detected"
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"classified_{image_path.name}"
            
            # 이미지 저장
            success = cv2.imwrite(str(output_path), classified_image)
            if success:
                print(f"  ✓ 결과 이미지 저장: {output_path}")
            else:
                print(f"  ✗ 결과 이미지 저장 실패: {output_path}")
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"Classification 결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    classify_images_in_folder(target_filename)

