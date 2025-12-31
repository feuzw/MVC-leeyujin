# 머신러닝 학습의 Hello World 와 같은 MNIST(손글씨 숫자 인식) 문제를 신경망으로 풀어봅니다.

import torch
import torch.nn as nn
import torch.optim as optim
import torch.nn.functional as F
from torchvision import datasets, transforms
from torch.utils.data import DataLoader

# MNIST 데이터를 다운로드하고 로드합니다.
# transforms.ToTensor()는 이미지를 텐서로 변환하고 0~1 범위로 정규화합니다.
transform = transforms.Compose([transforms.ToTensor()])

# 학습 데이터셋 로드
train_dataset = datasets.MNIST(root='./mnist/data', train=True, download=True, transform=transform)
# 테스트 데이터셋 로드
test_dataset = datasets.MNIST(root='./mnist/data', train=False, download=True, transform=transform)

#########
# 신경망 모델 구성
######
# 784(입력 특성값) -> 256 (히든레이어 뉴런 갯수) -> 256 (히든레이어 뉴런 갯수) -> 10 (결과값 0~9 분류)

class MNISTNet(nn.Module):
    def __init__(self):
        super(MNISTNet, self).__init__()
        # 입력층: 784 -> 256
        self.fc1 = nn.Linear(784, 256)
        # 히든층: 256 -> 256
        self.fc2 = nn.Linear(256, 256)
        # 출력층: 256 -> 10
        self.fc3 = nn.Linear(256, 10)
        
    def forward(self, x):
        # 입력 이미지를 1차원 벡터로 변환 (배치 크기, 784)
        x = x.view(-1, 784)
        # 첫 번째 레이어: ReLU 활성화 함수 적용
        x = F.relu(self.fc1(x))
        # 두 번째 레이어: ReLU 활성화 함수 적용
        x = F.relu(self.fc2(x))
        # 출력 레이어 (softmax는 손실 함수에서 처리)
        x = self.fc3(x)
        return x

#########
# 신경망 모델 학습
######

if __name__ == '__main__':
    # 모델 초기화
    model = MNISTNet()
    
    # 손실 함수: CrossEntropyLoss는 softmax와 cross entropy를 함께 처리합니다
    criterion = nn.CrossEntropyLoss()
    
    # 옵티마이저: Adam, 학습률 0.001
    optimizer = optim.Adam(model.parameters(), lr=0.001)
    
    # 데이터 로더 설정
    batch_size = 100
    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    test_loader = DataLoader(test_dataset, batch_size=batch_size, shuffle=False)
    
    # 학습 시작
    num_epochs = 15
    total_batch = len(train_loader)
    
    for epoch in range(num_epochs):
        total_cost = 0
        
        for batch_xs, batch_ys in train_loader:
            # 옵티마이저의 기울기 초기화
            optimizer.zero_grad()
            
            # 순전파: 모델에 입력을 전달하여 예측값 계산
            outputs = model(batch_xs)
            
            # 손실 계산
            loss = criterion(outputs, batch_ys)
            
            # 역전파: 기울기 계산
            loss.backward()
            
            # 가중치 업데이트
            optimizer.step()
            
            total_cost += loss.item()
        
        print('Epoch:', '%04d' % (epoch + 1),
              'Avg. cost =', '{:.3f}'.format(total_cost / total_batch))
    
    print('최적화 완료!')
    
    #########
    # 결과 확인
    ######
    # 모델을 평가 모드로 전환
    model.eval()
    
    correct = 0
    total = 0
    
    # 기울기 계산 비활성화 (메모리 절약 및 속도 향상)
    with torch.no_grad():
        for images, labels in test_loader:
            # 예측값 계산
            outputs = model(images)
            
            # 가장 높은 값을 가진 인덱스를 예측값으로 선택
            _, predicted = torch.max(outputs.data, 1)
            
            # 정확도 계산
            total += labels.size(0)
            correct += (predicted == labels).sum().item()
    
    accuracy = 100 * correct / total
    print('정확도:', '{:.2f}%'.format(accuracy))

