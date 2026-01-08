"use client";

import { useState, useRef, useEffect, DragEvent, ChangeEvent } from "react";
import { apiClient } from "@/lib/api/client";
import Header from "@/components/Header";

interface UploadedImage {
    file: File;
    preview: string;
    status: "pending" | "uploading" | "success" | "error";
    url?: string;
    error?: string;
}

interface DetectedImage {
    fileName: string;
    size: number;
    createdAt: number;
}

export default function UploadPage() {
    const [images, setImages] = useState<UploadedImage[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [detectedImages, setDetectedImages] = useState<DetectedImage[]>([]);
    const [isLoadingDetected, setIsLoadingDetected] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    };

    const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);

        // 파일 정보를 alert로 표시
        if (files.length > 0) {
            const fileInfo = files.map((file, index) => {
                const sizeInMB = (file.size / 1024 / 1024).toFixed(2);
                const lastModified = new Date(file.lastModified).toLocaleString('ko-KR');
                return `파일 ${index + 1}:
이름: ${file.name}
크기: ${sizeInMB} MB (${file.size.toLocaleString()} bytes)
타입: ${file.type || '알 수 없음'}
마지막 수정: ${lastModified}`;
            }).join('\n\n');

            alert(`드롭된 파일 정보:\n\n${fileInfo}`);
        }

        handleFiles(files);
    };

    const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            handleFiles(files);
        }
    };

    const handleFiles = (files: File[]) => {
        const imageFiles = files.filter((file) => file.type.startsWith("image/"));

        if (imageFiles.length === 0) {
            alert("이미지 파일만 업로드할 수 있습니다.");
            return;
        }

        const newImages: UploadedImage[] = imageFiles.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
            status: "pending" as const,
        }));

        setImages((prev) => [...prev, ...newImages]);
    };

    const handleUpload = async (index: number, processType: "detect" | "detect_face" | "segment" | "face_segment" | "pose" | "classification" = "detect") => {
        const image = images[index];
        if (!image || image.status === "uploading") return;

        setImages((prev) =>
            prev.map((img, i) =>
                i === index ? { ...img, status: "uploading" as const } : img
            )
        );

        try {
            const formData = new FormData();
            formData.append("file", image.file);
            formData.append("process_type", processType);

            // FastAPI로 파일 업로드
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const response = await fetch(`${apiBaseUrl}/api/upload`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.detail || errorData.error || "업로드 실패");
            }

            const data = await response.json();

            setImages((prev) =>
                prev.map((img, i) =>
                    i === index
                        ? {
                            ...img,
                            status: "success" as const,
                            url: data.fileName || data.path,
                        }
                        : img
                )
            );
        } catch (error: any) {
            setImages((prev) =>
                prev.map((img, i) =>
                    i === index
                        ? {
                            ...img,
                            status: "error" as const,
                            error: error.message || "업로드 실패",
                        }
                        : img
                )
            );
        }
    };

    const handleUploadAll = async (processType: "detect" | "detect_face" | "segment" | "face_segment" | "pose" | "classification" = "detect") => {
        const pendingImages = images
            .map((img, index) => ({ img, index }))
            .filter(({ img }) => img.status === "pending");

        for (const { index } of pendingImages) {
            await handleUpload(index, processType);
        }
    };

    const handleRemove = (index: number) => {
        setImages((prev) => {
            const image = prev[index];
            if (image?.preview) {
                URL.revokeObjectURL(image.preview);
            }
            return prev.filter((_, i) => i !== index);
        });
    };

    const handleClearAll = () => {
        images.forEach((image) => {
            if (image.preview) {
                URL.revokeObjectURL(image.preview);
            }
        });
        setImages([]);
    };

    // detected 이미지 목록 불러오기
    const fetchDetectedImages = async () => {
        setIsLoadingDetected(true);
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const response = await fetch(`${apiBaseUrl}/api/detected`);
            if (response.ok) {
                const data = await response.json();
                setDetectedImages(data.files || []);
            }
        } catch (error) {
            console.error("detected 이미지 목록 불러오기 실패:", error);
        } finally {
            setIsLoadingDetected(false);
        }
    };

    // 이미지 다운로드
    const handleDownload = async (fileName: string) => {
        try {
            const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
            const url = `${apiBaseUrl}/api/detected/${fileName}`;
            const response = await fetch(url);
            if (response.ok) {
                const blob = await response.blob();
                const downloadUrl = window.URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = downloadUrl;
                link.download = fileName;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(downloadUrl);
            }
        } catch (error) {
            console.error("다운로드 실패:", error);
            alert("다운로드 중 오류가 발생했습니다.");
        }
    };

    // 컴포넌트 마운트 시 및 업로드 성공 후 detected 이미지 목록 새로고침
    useEffect(() => {
        fetchDetectedImages();
        // 5초마다 자동 새로고침 (YOLO 처리 완료 대기)
        const interval = setInterval(fetchDetectedImages, 5000);
        return () => clearInterval(interval);
    }, []);

    // 업로드 성공 시 detected 이미지 목록 새로고침
    useEffect(() => {
        const hasSuccess = images.some(img => img.status === "success");
        if (hasSuccess) {
            // 업로드 성공 후 3초 뒤 새로고침 (YOLO 처리 시간 고려)
            const timer = setTimeout(fetchDetectedImages, 3000);
            return () => clearTimeout(timer);
        }
    }, [images]);

    return (
        <div className="min-h-screen bg-background">
            <Header title="이미지 업로드" />
            <div className="py-12 sm:py-16 lg:py-20 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12 space-y-4">
                        <h1 className="text-4xl sm:text-5xl font-light tracking-tight text-text-primary">
                            이미지 업로드
                        </h1>
                        <p className="text-lg font-light text-text-secondary max-w-2xl mx-auto leading-relaxed">
                            드래그 앤 드롭 또는 클릭하여 이미지를 업로드하세요
                        </p>
                    </div>

                    {/* 드래그 앤 드롭 영역 */}
                    <div
                        onDragEnter={handleDragEnter}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        className={`
                            border-2 border-dashed rounded-lg p-12 sm:p-16 text-center transition-all duration-300
                            ${isDragging
                                ? "border-accent/30 bg-surface"
                                : "border-border-subtle bg-surface/50 backdrop-blur-sm hover:border-accent-primary/20"
                            }
                        `}
                    >
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        <div className="space-y-6">
                            <div className="text-6xl opacity-50">📸</div>
                            <div className="space-y-4">
                                <p className="text-lg font-light text-text-primary">
                                    이미지를 여기에 드래그하거나
                                </p>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="px-8 py-3 bg-accent-primary text-white rounded-lg hover:bg-accent-secondary transition-all duration-300 font-light text-sm tracking-wide"
                                >
                                    파일 선택
                                </button>
                            </div>
                            <p className="text-sm font-light text-text-secondary">
                                PNG, JPG, GIF, WEBP 등 이미지 파일 지원
                            </p>
                        </div>
                    </div>

                    {/* 업로드된 이미지 목록 */}
                    {images.length > 0 && (
                        <div className="mt-12">
                            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                                <h2 className="text-2xl font-light tracking-tight text-text-primary">
                                    선택된 이미지 ({images.length})
                                </h2>
                                <div className="flex flex-wrap gap-2">
                                    <button
                                        onClick={() => handleUploadAll("detect")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Detect
                                    </button>
                                    <button
                                        onClick={() => handleUploadAll("detect_face")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Face Detect
                                    </button>
                                    <button
                                        onClick={() => handleUploadAll("segment")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Segment
                                    </button>
                                    <button
                                        onClick={() => handleUploadAll("face_segment")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Face Segment
                                    </button>
                                    <button
                                        onClick={() => handleUploadAll("pose")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Pose
                                    </button>
                                    <button
                                        onClick={() => handleUploadAll("classification")}
                                        disabled={images.every((img) => img.status !== "pending")}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 text-xs font-light"
                                    >
                                        모두 Classify
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        className="px-4 py-2 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 text-xs font-light"
                                    >
                                        모두 삭제
                                    </button>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {images.map((image, index) => (
                                    <div
                                        key={index}
                                        className="bg-surface backdrop-blur-sm rounded-lg overflow-hidden border border-border hover:border-accent-primary/40 transition-all duration-300"
                                    >
                                        <div className="relative aspect-square bg-background-soft">
                                            <img
                                                src={image.preview}
                                                alt={`Preview ${index + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                            {image.status === "uploading" && (
                                                <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center">
                                                    <div className="text-text-primary text-center">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-2 border-border-subtle border-t-accent-primary mx-auto mb-2"></div>
                                                        <p className="text-sm font-light">업로드 중...</p>
                                                    </div>
                                                </div>
                                            )}
                                            {image.status === "success" && (
                                                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                    ✓ 완료
                                                </div>
                                            )}
                                            {image.status === "error" && (
                                                <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border border-red-900/50 text-red-400 px-2.5 py-1 rounded text-xs font-light">
                                                    ✗ 실패
                                                </div>
                                            )}
                                        </div>
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <p className="text-sm font-light text-text-primary truncate mb-1">
                                                    {image.file.name}
                                                </p>
                                                <p className="text-xs font-light text-text-secondary">
                                                    {(image.file.size / 1024 / 1024).toFixed(2)} MB
                                                </p>
                                            </div>
                                            {image.error && (
                                                <p className="text-xs font-light text-red-400">{image.error}</p>
                                            )}
                                            {image.url && (
                                                <a
                                                    href={image.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs font-light text-text-secondary hover:text-text-primary transition-colors block truncate"
                                                >
                                                    {image.url}
                                                </a>
                                            )}
                                            <div className="space-y-2">
                                                {image.status === "pending" && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => handleUpload(index, "detect")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="객체 Detection"
                                                        >
                                                            Detect
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "detect_face")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="얼굴 Detection"
                                                        >
                                                            Face
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "segment")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="객체 Segmentation"
                                                        >
                                                            Segment
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "face_segment")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="얼굴 Segmentation"
                                                        >
                                                            Face Seg
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "pose")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="포즈(키포인트) Detection"
                                                        >
                                                            Pose
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "classification")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-accent-primary/40 hover:text-text-primary transition-all duration-300 font-light"
                                                            title="이미지 Classification"
                                                        >
                                                            Classify
                                                        </button>
                                                    </div>
                                                )}
                                                {(image.status === "success" || image.status === "error") && (
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <button
                                                            onClick={() => handleUpload(index, "detect")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Detect
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "detect_face")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Face
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "segment")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Segment
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "face_segment")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Face Seg
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "pose")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Pose
                                                        </button>
                                                        <button
                                                            onClick={() => handleUpload(index, "classification")}
                                                            className="px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary/70 text-xs rounded hover:border-border hover:text-text-secondary transition-all duration-300 font-light"
                                                        >
                                                            Classify
                                                        </button>
                                                    </div>
                                                )}
                                                <button
                                                    onClick={() => handleRemove(index)}
                                                    className="w-full px-3 py-1.5 bg-surface border border-border-subtle text-text-secondary text-xs rounded hover:border-red-900/30 hover:text-red-400 transition-all duration-300 font-light"
                                                >
                                                    삭제
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Detected 이미지 목록 */}
                    <div className="mt-16">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                            <h2 className="text-2xl font-light tracking-tight text-text-primary">
                                Detection 결과 ({detectedImages.length})
                            </h2>
                            <button
                                onClick={fetchDetectedImages}
                                disabled={isLoadingDetected}
                                className="px-6 py-2.5 bg-surface border border-border-subtle text-text-secondary rounded-lg hover:border-accent-primary/40 hover:text-text-primary disabled:border-border-subtle disabled:text-text-secondary/50 disabled:cursor-not-allowed transition-all duration-300 flex items-center gap-2 text-sm font-light"
                            >
                                {isLoadingDetected ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-border-subtle border-t-accent-primary"></div>
                                        <span>로딩 중...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>🔄</span>
                                        <span>새로고침</span>
                                    </>
                                )}
                            </button>
                        </div>

                        {detectedImages.length === 0 ? (
                            <div className="bg-surface backdrop-blur-sm rounded-lg border border-border-subtle p-12 sm:p-16 text-center">
                                <div className="text-6xl mb-4 opacity-50">📭</div>
                                <p className="text-base font-light text-text-secondary">
                                    {isLoadingDetected ? "로딩 중..." : "Detection 결과가 없습니다. 이미지를 업로드하면 자동으로 처리됩니다."}
                                </p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {detectedImages.map((detectedImage, index) => {
                                    const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
                                    const imageUrl = `${apiBaseUrl}/api/detected/${detectedImage.fileName}`;
                                    const sizeInMB = (detectedImage.size / 1024 / 1024).toFixed(2);
                                    const createdDate = new Date(detectedImage.createdAt * 1000).toLocaleString('ko-KR');

                                    return (
                                        <div
                                            key={index}
                                            className="bg-surface backdrop-blur-sm rounded-lg overflow-hidden border border-border-subtle hover:border-accent-primary/30 transition-all duration-300"
                                        >
                                            <div className="relative aspect-square bg-background-soft">
                                                <img
                                                    src={imageUrl}
                                                    alt={detectedImage.fileName}
                                                    className="w-full h-full object-cover"
                                                    loading="lazy"
                                                />
                                                {detectedImage.fileName.startsWith("face_detected_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        👤 얼굴
                                                    </div>
                                                )}
                                                {detectedImage.fileName.startsWith("detected_") && !detectedImage.fileName.startsWith("face_detected_") && !detectedImage.fileName.startsWith("pose_detected_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        🎯 객체
                                                    </div>
                                                )}
                                                {detectedImage.fileName.startsWith("pose_detected_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        🧍 포즈
                                                    </div>
                                                )}
                                                {detectedImage.fileName.startsWith("segmented_") && !detectedImage.fileName.startsWith("face_segmented_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        🎨 세그먼트
                                                    </div>
                                                )}
                                                {detectedImage.fileName.startsWith("face_segmented_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        👤 얼굴 세그먼트
                                                    </div>
                                                )}
                                                {detectedImage.fileName.startsWith("classified_") && (
                                                    <div className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm border border-border-subtle text-text-primary px-2.5 py-1 rounded text-xs font-light">
                                                        🏷️ 분류
                                                    </div>
                                                )}
                                            </div>
                                            <div className="p-4 space-y-3">
                                                <div>
                                                    <p className="text-sm font-light text-text-primary truncate mb-1">
                                                        {detectedImage.fileName}
                                                    </p>
                                                    <p className="text-xs font-light text-text-secondary mb-1">
                                                        {sizeInMB} MB
                                                    </p>
                                                    <p className="text-xs font-light text-text-secondary">
                                                        {createdDate}
                                                    </p>
                                                </div>
                                                <button
                                                    onClick={() => handleDownload(detectedImage.fileName)}
                                                    className="w-full px-3 py-2 bg-accent-primary text-white text-sm rounded-lg hover:bg-accent-secondary transition-all duration-300 flex items-center justify-center gap-2 font-light"
                                                >
                                                    <span>⬇️</span>
                                                    <span>다운로드</span>
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

