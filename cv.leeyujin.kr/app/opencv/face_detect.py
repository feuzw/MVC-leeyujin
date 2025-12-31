import cv2

class FaceDetect:
    
    def __init__(self):
        self._cascade = '../data/opencv/haarcascade_frontalface_alt.xml'
        self._girl = '../data/opencv/lena.jpg'

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
            cv2.rectangle(img, (x,y), (x+w,y+h), (0,0,255), 2)
        cv2.imwrite("lena-face.png", img)
        cv2.imshow("lena-face", img)
        cv2.waitKey(0)
        cv2.destroyAllWindows()

if __name__ == "__main__":
    face_detect = FaceDetect()
    face_detect.read_file()