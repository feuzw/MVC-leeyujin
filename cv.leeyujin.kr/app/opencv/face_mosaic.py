import cv2

class FaceMosaic:
    
    def __init__(self):
        self._cascade = '../data/opencv/haarcascade_frontalface_alt.xml'
        self._girl = '../data/opencv/many.jpg'

    def read_file(self):
        cascade = cv2.CascadeClassifier(self._cascade)
        img = cv2.imread(self._girl)
        face = cascade.detectMultiScale(img, minSize=(30,30))
        if len(face) == 0:
            print("No face found")
            quit()
        for idx, (x,y,w,h) in enumerate(face):
            print("얼굴 인식 인덱스: ", idx)
            print("얼굴 인식 좌표: ", x,y,w,h)
            img = self.mosaic(img, (x,y,x+w,y+h), 10)
            # 사각형 없이 모자이크만 생성해도 됨
            # cv2.rectangle(img, (x,y), (x+w,y+h), (0,0,255), 2)
            # 사각형 색상 변경
            cv2.rectangle(img, (x,y), (x+w,y+h), (255,0,0), 2)
        cv2.imwrite("many-mosaic.png", img)
        cv2.imshow("many-mosaic", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()
    
    @staticmethod
    def mosaic(img, rect, size):
        (x1,y1,x2,y2) = rect
        w = x2 - x1
        h = y2 - y1
        i_rect = img[y1:y2, x1:x2]
        i_small = cv2.resize(i_rect, (size, size))
        i_mosaic = cv2.resize(i_small, (w,h), interpolation=cv2.INTER_AREA)
        img2 = img.copy()
        img2[y1:y2, x1:x2] = i_mosaic
        return img2

if __name__ == "__main__":
    face_mosaic = FaceMosaic()
    face_mosaic.read_file()