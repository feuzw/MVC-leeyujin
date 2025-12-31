"""
YOLO pose 모델을 사용하여 data/yolo 폴더의 이미지들에서 사람의 포즈(키포인트) 인식
"""
from ultralytics import YOLO
import cv2
import numpy as np
from pathlib import Path
import sys

def detect_pose_in_folder(target_filename=None):
    """
    data/yolo 폴더에 있는 이미지에서 사람의 포즈(키포인트) 인식
    target_filename이 지정되면 해당 파일만 처리, None이면 모든 파일 처리
    """
    # YOLO pose 모델 로드 (YOLOv11-pose 또는 YOLOv8-pose)
    print("YOLO pose 모델 로드 중...")
    model_path = Path(__file__).parent.parent / "data" / "model" / "yolo11n-pose.pt"
    
    # 모델 파일이 없으면 자동 다운로드 시도
    if not model_path.exists():
        print(f"⚠ 모델 파일을 찾을 수 없습니다: {model_path}")
        print("YOLOv11n-pose 모델을 자동 다운로드합니다...")
        model = YOLO("yolo11n-pose")  # 자동 다운로드
    else:
        model = YOLO(str(model_path))
    
    print("✓ YOLO pose 모델 로드 완료")
    
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
            and 'face_segmented' not in str(f) and 'pose_' not in str(f)
        ]
        
        if not image_files:
            print(f"✗ {image_dir} 폴더에 이미지 파일이 없습니다.")
            return
        
        print(f"\n✓ {len(image_files)}개의 이미지 파일을 찾았습니다.\n")
    
    # 각 이미지에 대해 pose detection 수행
    for idx, image_path in enumerate(image_files, 1):
        print(f"[{idx}/{len(image_files)}] 처리 중: {image_path.name}")
        
        try:
            # 원본 이미지 로드
            original_image = cv2.imread(str(image_path))
            if original_image is None:
                print(f"  ✗ 이미지를 읽을 수 없습니다: {image_path}")
                continue
            
            # YOLO pose detection 수행
            results = model.predict(
                source=str(image_path),
                conf=0.25,  # confidence threshold
                save=False,
                show=False,
            )
            
            # 결과 가져오기
            result = results[0]
            
            # 원본 이미지 복사 (결과 이미지용)
            pose_image = original_image.copy()
            
            # Pose detection 결과 처리
            person_count = 0
            
            if result.keypoints is not None and len(result.keypoints) > 0:
                # 키포인트가 있는 경우
                keypoints = result.keypoints.data.cpu().numpy()
                boxes = result.boxes
                
                # COCO 포즈 키포인트 연결 정보 (17개 키포인트)
                # 0: nose, 1: left_eye, 2: right_eye, 3: left_ear, 4: right_ear,
                # 5: left_shoulder, 6: right_shoulder, 7: left_elbow, 8: right_elbow,
                # 9: left_wrist, 10: right_wrist, 11: left_hip, 12: right_hip,
                # 13: left_knee, 14: right_knee, 15: left_ankle, 16: right_ankle
                skeleton = [
                    [0, 1], [0, 2], [1, 3], [2, 4],  # 머리
                    [5, 6],  # 어깨
                    [5, 7], [7, 9],  # 왼쪽 팔
                    [6, 8], [8, 10],  # 오른쪽 팔
                    [5, 11], [6, 12],  # 몸통
                    [11, 12],  # 골반
                    [11, 13], [13, 15],  # 왼쪽 다리
                    [12, 14], [14, 16],  # 오른쪽 다리
                ]
                
                # 키포인트 색상 (BGR)
                keypoint_colors = [
                    (255, 0, 0),    # nose - 파란색
                    (0, 255, 0),    # left_eye - 초록색
                    (0, 0, 255),    # right_eye - 빨간색
                    (255, 255, 0),  # left_ear - 청록색
                    (255, 0, 255), # right_ear - 마젠타
                    (0, 255, 255), # left_shoulder - 노란색
                    (128, 0, 128), # right_shoulder - 보라색
                    (255, 165, 0), # left_elbow - 주황색
                    (0, 128, 255), # right_elbow - 주황-파랑
                    (128, 128, 0), # left_wrist - 올리브
                    (128, 0, 128), # right_wrist - 보라색
                    (0, 128, 128), # left_hip - 청록
                    (128, 128, 128), # right_hip - 회색
                    (255, 192, 203), # left_knee - 핑크
                    (192, 192, 192), # right_knee - 은색
                    (0, 255, 127), # left_ankle - 봄 초록
                    (255, 20, 147), # right_ankle - 딥 핑크
                ]
                
                # 각 사람의 포즈 그리기
                for i, (box, keypoint) in enumerate(zip(boxes, keypoints)):
                    cls_id = int(box.cls[0])
                    conf = float(box.conf[0])
                    cls_name = model.names[cls_id] if cls_id in model.names else "unknown"
                    
                    # person 클래스만 처리
                    if cls_name.lower() == 'person':
                        person_count += 1
                        
                        # Bounding box 그리기
                        x1, y1, x2, y2 = box.xyxy[0].cpu().numpy().astype(int)
                        cv2.rectangle(pose_image, (x1, y1), (x2, y2), (0, 255, 0), 2)
                        
                        # 라벨 추가
                        label = f"Person {person_count} {conf:.2f}"
                        cv2.putText(pose_image, label, (x1, y1 - 10),
                                  cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
                        
                        # 키포인트 그리기
                        visible_keypoints = []
                        for kp_idx, kp in enumerate(keypoint):
                            if len(kp) >= 3:  # x, y, confidence
                                x, y, kp_conf = int(kp[0]), int(kp[1]), kp[2]
                                if kp_conf > 0.3:  # confidence threshold
                                    visible_keypoints.append((kp_idx, x, y))
                                    # 키포인트 점 그리기
                                    color = keypoint_colors[kp_idx % len(keypoint_colors)]
                                    cv2.circle(pose_image, (x, y), 5, color, -1)
                        
                        # 스켈레톤(뼈대) 그리기
                        for connection in skeleton:
                            pt1_idx, pt2_idx = connection
                            if pt1_idx < len(keypoint) and pt2_idx < len(keypoint):
                                kp1 = keypoint[pt1_idx]
                                kp2 = keypoint[pt2_idx]
                                if len(kp1) >= 3 and len(kp2) >= 3:
                                    x1_kp, y1_kp, conf1 = int(kp1[0]), int(kp1[1]), kp1[2]
                                    x2_kp, y2_kp, conf2 = int(kp2[0]), int(kp2[1]), kp2[2]
                                    if conf1 > 0.3 and conf2 > 0.3:
                                        cv2.line(pose_image, (x1_kp, y1_kp), (x2_kp, y2_kp), (0, 255, 255), 2)
                
                print(f"  ✓ {person_count}명의 사람의 포즈를 감지했습니다.")
            else:
                # 키포인트가 없는 경우
                if len(result.boxes) > 0:
                    print(f"  ⚠ {len(result.boxes)}개의 객체를 감지했지만 포즈 키포인트가 없습니다.")
                    # Detection 결과만 표시
                    annotated_image = result.plot()
                    pose_image = annotated_image
                else:
                    print("  - 감지된 사람이 없습니다.")
            
            # 결과 이미지 저장
            output_dir = image_dir / "detected"
            output_dir.mkdir(exist_ok=True)
            output_path = output_dir / f"pose_detected_{image_path.name}"
            cv2.imwrite(str(output_path), pose_image)
            print(f"  ✓ 결과 이미지 저장: {output_path}")
            
        except Exception as e:
            print(f"  ✗ 오류 발생: {e}")
            import traceback
            traceback.print_exc()
        
        print()
    
    print("✓ 모든 이미지 처리 완료!")
    print(f"포즈 detection 결과 이미지는 {image_dir / 'detected'} 폴더에 저장되었습니다.")


if __name__ == "__main__":
    # 명령줄 인자로 파일명을 받을 수 있음
    target_filename = sys.argv[1] if len(sys.argv) > 1 else None
    detect_pose_in_folder(target_filename)

