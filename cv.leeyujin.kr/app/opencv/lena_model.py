import cv2
import numpy as np
import os

class LenaModel:

    def __init__(self):
        self._cascade = '../data/opencv/haarcascade_frontalface_alt.xml'
        self._fname = '../data/opencv/lena.jpg'

    def read_file(self):
        cascade = cv2.CascadeClassifier(self._cascade)
        img = cv2.imread(self._fname)
        face = cascade.detectMultiScale(img, minSize=(30,30))
        if len(face) == 0:
            print("No face found")
            quit()
        
        # 원본 이미지를 3개 복사 (전체 이미지는 그대로 유지)
        original_img = img.copy()
        gray_img = img.copy()
        unchange_img = img.copy()
        
        # 각 얼굴 영역 처리
        for idx, (x,y,w,h) in enumerate(face):
            print("얼굴 인식 인덱스: ", idx)
            print("얼굴 인식 좌표: ", x,y,w,h)
            cv2.rectangle(original_img, (x,y), (x+w,y+h), (0,0,255), 2)
            
            # 얼굴 영역만 잘라내기
            face_roi = img[y:y+h, x:x+w]
            
            # 얼굴 영역을 임시 파일로 저장
            face_filename = f'temp_face_{idx}.png'
            cv2.imwrite(face_filename, face_roi)
            
            # excute 함수로 변환된 결과 받기
            original_face, gray_face, unchange_face = self.excute(face_filename)
            
            # 변환된 얼굴 영역을 전체 이미지에 적용
            # Original: 원본 그대로 (사각형만 그려진 상태)
            
            # Gray: 그레이스케일 얼굴 영역 적용
            if len(gray_face.shape) == 2:
                # 1채널을 3채널로 변환 (numpy 사용, cvtColor 없이)
                gray_face = np.stack([gray_face] * 3, axis=-1)
            gray_img[y:y+h, x:x+w] = gray_face
            # Gray 이미지에도 사각형 그리기
            cv2.rectangle(gray_img, (x,y), (x+w,y+h), (0,0,255), 2)
            
            # Unchange: 알파 채널 포함 얼굴 영역 적용
            if len(unchange_face.shape) == 3 and unchange_face.shape[2] == 4:
                # BGRA를 BGR로 변환 (numpy 인덱싱 사용)
                unchange_face = unchange_face[:, :, :3]
            unchange_img[y:y+h, x:x+w] = unchange_face
            # Unchange 이미지에도 사각형 그리기
            cv2.rectangle(unchange_img, (x,y), (x+w,y+h), (0,0,255), 2)
            
            # 임시 파일 삭제
            if os.path.exists(face_filename):
                os.remove(face_filename)
        
        # 전체 이미지 표시 (얼굴 부분만 변환된 결과)
        cv2.imshow("lena-face (Original)", original_img)
        cv2.imshow("lena-face (Gray)", gray_img)
        cv2.imshow("lena-face (Unchange)", unchange_img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    @staticmethod
    def excute(img):
        original = cv2.imread(img, cv2.IMREAD_COLOR)
        gray = cv2.imread(img, cv2.IMREAD_GRAYSCALE)
        unchange = cv2.imread(img, cv2.IMREAD_UNCHANGED)
        """
        이미지 읽기 3가지 속성
        대신 1, 0, -1 사용 가능
        1: 컬러 이미지
        0: 그레이스케일 이미지
        -1: 컬러 이미지 + 알파 채널
        """
        # 변환된 이미지들을 반환
        return original, gray, unchange


if __name__ == "__main__":
    lena_model = LenaModel()
    lena_model.read_file()