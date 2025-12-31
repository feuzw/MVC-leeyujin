# FastAPI 엔트리 + 정적 파일 서빙(/outputs/...) 
# + 라우팅 등록입니다.
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from pathlib import Path
import torch

from api.v1.routes.generate import router as generate_router
from core.config import OUTPUTS_DIR, DEVICE

app = FastAPI(title="Diffusers API", version="1.0.0")

# outputs 디렉토리 생성 (존재하지 않을 경우)
OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)

# outputs 정적 서빙 (로컬 개발/단독 서버에서 편리)
app.mount("/outputs", StaticFiles(directory=str(OUTPUTS_DIR)), name="outputs")

app.include_router(generate_router, prefix="/api/v1")

@app.get("/health")
def health():
    cuda_available = torch.cuda.is_available()
    actual_device = "cuda" if (DEVICE == "cuda" and cuda_available) else "cpu"
    
    device_info = {
        "configured_device": DEVICE,
        "cuda_available": cuda_available,
        "actual_device": actual_device,
    }
    
    if cuda_available:
        device_info["cuda_device_name"] = torch.cuda.get_device_name(0)
        device_info["cuda_device_count"] = torch.cuda.device_count()
    
    return {
        "ok": True,
        "device": device_info
    }