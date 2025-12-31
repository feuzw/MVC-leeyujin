"""
FastAPI 서버 + Watchdog - 이미지 업로드 API 및 자동 YOLO detection
"""
from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pathlib import Path
import uuid
import time
import subprocess
import sys
import threading
import hashlib
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# FastAPI 앱 생성
app = FastAPI(title="YOLO Image Upload & Detection API")

# CORS 설정
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js 개발 서버
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 프로젝트 경로 설정
SCRIPT_DIR = Path(__file__).parent
BASE_DIR = SCRIPT_DIR.parent.parent  # app/yolo -> app -> cv.leeyujin.kr
DATA_DIR = BASE_DIR / "app" / "data" / "yolo"
DATA_DIR.mkdir(parents=True, exist_ok=True)
DETECTED_DIR = DATA_DIR / "detected"
DETECTED_DIR.mkdir(parents=True, exist_ok=True)

# 허용되는 이미지 확장자
ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".bmp", ".tiff", ".webp"}
# 최대 파일 크기 (50MB)
MAX_FILE_SIZE = 50 * 1024 * 1024

# YOLO 스크립트 경로
DETECTION_SCRIPT = SCRIPT_DIR / "yolo_detection.py"
FACE_DETECTION_SCRIPT = SCRIPT_DIR / "yolo_face_detection.py"
SEGMENT_SCRIPT = SCRIPT_DIR / "yolo_segment.py"
FACE_SEGMENT_SCRIPT = SCRIPT_DIR / "yolo_face_segment.py"
POSE_SCRIPT = SCRIPT_DIR / "yolo_pose.py"
CLASSIFICATION_SCRIPT = SCRIPT_DIR / "yolo_classfication.py"


class YoloImageHandler(FileSystemEventHandler):
    """이미지 파일이 추가되면 yolo_detection.py와 yolo_face_detection.py를 실행하는 핸들러"""
    
    def __init__(self, detection_script, face_detection_script):
        super().__init__()
        self.detection_script = detection_script
        self.face_detection_script = face_detection_script
        self.processed_files = set()
        self.image_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.webp'}
    
    def run_script(self, script_path, script_name):
        """스크립트 실행 헬퍼 함수"""
        try:
            print(f"🚀 {script_name} 시작...")
            result = subprocess.run(
                [sys.executable, str(script_path)],
                cwd=str(script_path.parent),
                capture_output=True,
                text=True,
                timeout=300  # 5분 타임아웃
            )
            
            if result.returncode == 0:
                print(f"✓ {script_name} 완료!")
                if result.stdout:
                    print(result.stdout)
                return True
            else:
                print(f"✗ {script_name} 실패: {result.stderr}")
                return False
            
        except subprocess.TimeoutExpired:
            print(f"✗ {script_name} 타임아웃 (5분 초과)")
            return False
        except Exception as e:
            print(f"✗ {script_name} 오류 발생: {e}")
            return False
    
    def on_created(self, event):
        """새 파일이 생성되면 호출"""
        if event.is_directory:
            return
        
        file_path = Path(event.src_path)
        
        # 이미지 파일인지 확인
        if file_path.suffix.lower() not in self.image_extensions:
            return
        
        # 이미 처리한 파일인지 확인 (중복 실행 방지)
        if str(file_path) in self.processed_files:
            return
        
        # detected 폴더의 파일은 무시
        if 'detected' in str(file_path) or 'face_' in str(file_path):
            return
        
        print(f"\n🔄 새 이미지 파일 감지: {file_path.name}")
        print(f"📍 경로: {file_path}")
        
        # 파일이 완전히 쓰여질 때까지 잠시 대기
        time.sleep(1)
        
        # yolo_detection.py 실행
        self.run_script(self.detection_script, "YOLO 객체 detection")
        
        # yolo_face_detection.py 실행
        self.run_script(self.face_detection_script, "YOLO 얼굴 detection")
        
        # 처리한 파일 기록
        self.processed_files.add(str(file_path))
        print(f"✅ 처리 완료: {file_path.name}\n")


def start_watchdog():
    """Watchdog을 백그라운드에서 시작"""
    if not DETECTION_SCRIPT.exists():
        print(f"✗ yolo_detection.py 파일을 찾을 수 없습니다: {DETECTION_SCRIPT}")
        return
    
    if not FACE_DETECTION_SCRIPT.exists():
        print(f"✗ yolo_face_detection.py 파일을 찾을 수 없습니다: {FACE_DETECTION_SCRIPT}")
        return
    
    if not DATA_DIR.exists():
        print(f"✗ 감시할 폴더를 찾을 수 없습니다: {DATA_DIR}")
        DATA_DIR.mkdir(parents=True, exist_ok=True)
    
    print("=" * 60)
    print("📁 YOLO 이미지 감시 시작")
    print(f"📍 감시 폴더: {DATA_DIR}")
    print(f"🔧 객체 detection 스크립트: {DETECTION_SCRIPT.name}")
    print(f"🔧 얼굴 detection 스크립트: {FACE_DETECTION_SCRIPT.name}")
    print("=" * 60)
    print("\n💡 새 이미지 파일이 업로드되면 자동으로 YOLO detection이 실행됩니다.\n")
    
    # 파일 시스템 감시자 설정
    event_handler = YoloImageHandler(DETECTION_SCRIPT, FACE_DETECTION_SCRIPT)
    observer = Observer()
    observer.schedule(event_handler, str(DATA_DIR), recursive=False)
    observer.start()
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n\n⏹️  감시 중지 중...")
        observer.stop()
    
    observer.join()
    print("✅ 감시 종료")


# FastAPI 엔드포인트
@app.get("/")
async def root():
    """헬스 체크"""
    return {"message": "YOLO Image Upload & Detection API", "status": "running"}


@app.post("/api/upload")
async def upload_file(
    file: UploadFile = File(...),
    process_type: str = Form("detect")
):
    """
    이미지 파일 업로드
    
    - 파일을 data/yolo 폴더에 저장
    - UUID를 사용하여 파일명 충돌 방지
    - 저장된 파일 정보 반환
    - process_type에 따라 해당 YOLO 스크립트 실행
      - detect: 일반 객체 detection
      - detect_face: 얼굴 detection
      - segment: 객체 segmentation
      - face_segment: 얼굴 segmentation
      - pose: 포즈(키포인트) detection
      - classification: 이미지 classification
    """
    try:
        # 파일 확장자 검증
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=400,
                detail=f"허용되지 않는 파일 형식입니다. 허용 형식: {', '.join(ALLOWED_EXTENSIONS)}"
            )
        
        # 파일 읽기
        contents = await file.read()
        file_size = len(contents)
        
        # 파일 크기 검증
        if file_size > MAX_FILE_SIZE:
            raise HTTPException(
                status_code=400,
                detail=f"파일 크기가 너무 큽니다. 최대 크기: {MAX_FILE_SIZE / 1024 / 1024}MB"
            )
        
        if file_size == 0:
            raise HTTPException(status_code=400, detail="빈 파일입니다.")
        
        # 파일 내용의 해시 계산 (중복 파일 확인용)
        file_hash = hashlib.md5(contents).hexdigest()
        
        # 같은 해시를 가진 파일이 이미 있는지 확인
        existing_file = None
        for existing_path in DATA_DIR.iterdir():
            if existing_path.is_file() and existing_path.suffix.lower() in ALLOWED_EXTENSIONS:
                # detected 폴더의 파일은 제외
                if "detected" not in str(existing_path):
                    try:
                        with open(existing_path, "rb") as f:
                            existing_hash = hashlib.md5(f.read()).hexdigest()
                            if existing_hash == file_hash:
                                existing_file = existing_path
                                break
                    except Exception:
                        continue
        
        # 원본 파일명 저장 (항상 필요)
        original_filename = file.filename
        
        # 같은 파일이 이미 있으면 기존 파일 사용, 없으면 새로 저장
        if existing_file:
            safe_filename = existing_file.name
            file_path = existing_file
            print(f"♻️  기존 파일 재사용: {safe_filename} (해시: {file_hash[:8]}...)")
        else:
            # 파일명 생성 (원본 파일명 그대로 사용)
            safe_filename = original_filename
            file_path = DATA_DIR / safe_filename
            
            # 같은 이름의 파일이 이미 있으면 덮어쓰기 방지를 위해 번호 추가
            if file_path.exists():
                base_name = file_path.stem
                extension = file_path.suffix
                counter = 1
                while file_path.exists():
                    safe_filename = f"{base_name}_{counter}{extension}"
                    file_path = DATA_DIR / safe_filename
                    counter += 1
            
            # 파일 저장
            with open(file_path, "wb") as f:
                f.write(contents)
            print(f"💾 새 파일 저장: {safe_filename} (해시: {file_hash[:8]}...)")
        
        # process_type에 따라 해당 스크립트 실행
        script_to_run = None
        script_name = ""
        result_file_prefix = ""
        
        if process_type == "detect":
            script_to_run = DETECTION_SCRIPT
            script_name = "yolo_detection.py"
            result_file_prefix = "detected_"
        elif process_type == "detect_face":
            script_to_run = FACE_DETECTION_SCRIPT
            script_name = "yolo_face_detection.py"
            result_file_prefix = "face_detected_"
        elif process_type == "segment":
            script_to_run = SEGMENT_SCRIPT
            script_name = "yolo_segment.py"
            result_file_prefix = "segmented_"
        elif process_type == "face_segment":
            script_to_run = FACE_SEGMENT_SCRIPT
            script_name = "yolo_face_segment.py"
            result_file_prefix = "face_segmented_"
        elif process_type == "pose":
            script_to_run = POSE_SCRIPT
            script_name = "yolo_pose.py"
            result_file_prefix = "pose_detected_"
        elif process_type == "classification":
            script_to_run = CLASSIFICATION_SCRIPT
            script_name = "yolo_classfication.py"
            result_file_prefix = "classified_"
        else:
            # 기본값: detect
            script_to_run = DETECTION_SCRIPT
            script_name = "yolo_detection.py"
            result_file_prefix = "detected_"
        
        # 이미 처리된 결과 파일이 있는지 확인
        expected_result_file = DETECTED_DIR / f"{result_file_prefix}{safe_filename}"
        already_processed = expected_result_file.exists()
        
        # 스크립트 실행 (비동기로 백그라운드 실행) - 이미 처리된 경우 스킵
        if already_processed:
            print(f"⏭️  이미 처리된 파일입니다: {safe_filename}")
            print(f"   결과 파일: {expected_result_file.name}")
            # 이미 처리된 경우에도 성공 응답 반환 (에러 없이)
        elif script_to_run and script_to_run.exists():
            def run_script_thread():
                """스크립트를 백그라운드에서 실행"""
                try:
                    print(f"🚀 {script_name} 시작...")
                    result = subprocess.run(
                        [sys.executable, str(script_to_run), safe_filename],
                        cwd=str(script_to_run.parent),
                        capture_output=True,
                        text=True,
                        encoding='utf-8',
                        errors='replace',  # 인코딩 에러 시 대체 문자 사용
                        timeout=300  # 5분 타임아웃
                    )
                    
                    if result.returncode == 0:
                        print(f"✓ {script_name} 완료!")
                        if result.stdout:
                            print(result.stdout)
                    else:
                        print(f"✗ {script_name} 실패 (코드: {result.returncode})")
                        if result.stderr:
                            print(result.stderr)
                except subprocess.TimeoutExpired:
                    print(f"✗ {script_name} 타임아웃 (5분 초과)")
                except Exception as e:
                    print(f"✗ {script_name} 오류 발생: {e}")
            
            thread = threading.Thread(target=run_script_thread, daemon=True)
            thread.start()
            print(f"📤 {script_name} 백그라운드 실행 시작")
        
        # 저장된 파일 정보 반환
        message = "파일이 성공적으로 저장되었습니다."
        if already_processed:
            message = "이미 처리된 파일입니다. 결과 파일이 이미 존재합니다."
        elif existing_file:
            message = "기존 파일을 재사용합니다."
        
        return JSONResponse({
            "success": True,
            "message": message,
            "fileName": safe_filename,
            "originalFileName": original_filename,
            "path": str(file_path.relative_to(BASE_DIR)),
            "size": file_size,
            "mimeType": file.content_type,
            "processType": process_type,
            "alreadyProcessed": already_processed,
        })
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파일 업로드 중 오류가 발생했습니다: {str(e)}"
        )


@app.get("/api/files")
async def list_files():
    """
    업로드된 파일 목록 조회
    """
    try:
        files = []
        for file_path in DATA_DIR.iterdir():
            if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                # detected 폴더의 파일은 제외
                if "detected" not in str(file_path):
                    stat = file_path.stat()
                    files.append({
                        "fileName": file_path.name,
                        "size": stat.st_size,
                        "createdAt": stat.st_ctime,
                    })
        
        return JSONResponse({
            "success": True,
            "files": files,
            "count": len(files),
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파일 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )


@app.get("/api/detected")
async def list_detected_files():
    """
    detected 폴더의 이미지 목록 조회
    """
    try:
        files = []
        if DETECTED_DIR.exists():
            for file_path in DETECTED_DIR.iterdir():
                if file_path.is_file() and file_path.suffix.lower() in ALLOWED_EXTENSIONS:
                    stat = file_path.stat()
                    files.append({
                        "fileName": file_path.name,
                        "size": stat.st_size,
                        "createdAt": stat.st_ctime,
                    })
        
        # 생성일 기준 내림차순 정렬 (최신순)
        files.sort(key=lambda x: x["createdAt"], reverse=True)
        
        return JSONResponse({
            "success": True,
            "files": files,
            "count": len(files),
        })
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"detected 파일 목록 조회 중 오류가 발생했습니다: {str(e)}"
        )


@app.get("/api/detected/{filename}")
async def get_detected_file(filename: str):
    """
    detected 폴더의 이미지 파일 다운로드
    """
    try:
        file_path = DETECTED_DIR / filename
        
        # 보안: 경로 탐색 공격 방지
        if not file_path.exists() or not file_path.is_file():
            raise HTTPException(status_code=404, detail="파일을 찾을 수 없습니다.")
        
        # 파일 확장자 검증
        if file_path.suffix.lower() not in ALLOWED_EXTENSIONS:
            raise HTTPException(status_code=400, detail="허용되지 않는 파일 형식입니다.")
        
        return FileResponse(
            path=str(file_path),
            filename=filename,
            media_type="image/jpeg" if file_path.suffix.lower() in {".jpg", ".jpeg"} else "image/png"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"파일 다운로드 중 오류가 발생했습니다: {str(e)}"
        )


@app.on_event("startup")
async def startup_event():
    """서버 시작 시 Watchdog 자동 시작 (비활성화됨)"""
    # Watchdog 자동 실행 비활성화
    # 업로드 API에서 process_type에 따라 적절한 스크립트를 실행하므로
    # Watchdog의 자동 실행은 중복 처리로 인한 문제를 일으킵니다.
    # watchdog_thread = threading.Thread(target=start_watchdog, daemon=True)
    # watchdog_thread.start()
    # print("✓ Watchdog이 백그라운드에서 시작되었습니다.")
    print("ℹ️  Watchdog 자동 실행이 비활성화되었습니다. 업로드 API를 통해 처리됩니다.")


if __name__ == "__main__":
    import uvicorn
    print("🚀 FastAPI 서버 시작 중...")
    print("📍 서버 주소: http://localhost:8000")
    print("📖 API 문서: http://localhost:8000/docs")
    print("💡 업로드 API를 통해 process_type에 따라 처리됩니다.\n")
    uvicorn.run(app, host="0.0.0.0", port=8000)
