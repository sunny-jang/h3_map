## 구상 및 설계 방식

1. 맵 이니셜라이징
- map, 초기 polygon 이니셜라이징 라이프 사이클 useEffect를 사용하여 훅으로 구현
- map, polygon 옵션들을 constants 파일로 분리

2. 서버에서 받아온 폴리곤 index를 좌표값으로 변환해 영역 생성
- utills에 h3를 사용해 데이터를 파싱하는 함수들을 생성
- 각 역할마다 분리 후 재사용성 고려
- 데이터 저장으로 swr 사용

3. 내가 선택한 영역의 폴리곤 표시하기
- 선택된 영역의 index 리스트를 저장할 hexList 로컬 스테이트 생성
- 기존의 영역에서 duplicate 체크
- 새로 선택한 지역에서 duplicate 체크
- 중복되지 않는 영역 index만 hexList에 추가
- 업데이트된 hexList를 참조하는 eventListener 할당 및 기존 할당 제거
- hexList 업데이트 시 마다 신규 폴리곤 객체에 path 추가

4. 선택 영역 전송하며 데이터 리셋
- hexList를 {indexs: hexList} 형식으로 서버에 전송
- response를 받아오기 전 hexList로 로컬 폴리곤 영역을 업데이트
- 새로 선택된 hexList 리셋, 기존 신규 폴리곤 영역을 제거, 새로운 폴리곤 객체 생성

## 프로젝트 구조

/h3_map
    /public
         index.html
    /types
        index.d.ts
        hex.d.ts
    /src
        /components
           H3Map.tsx
    /utills
        mapUtills.ts
    App.tsx
    tsconfig.json

/server - localhost:8000

## 기타 참고 사항

클릭 이벤트 리스너를 적용시키며 겪은 이벤트 리스너 lexcical scope 그리고,
useCallback 사용에 대해 글로 남겨보았습니다. 

[https://sunny-jang.tistory.com/64](https://sunny-jang.tistory.com/64)


## 구현 이미지
![image](https://user-images.githubusercontent.com/35230852/214820186-9e93e901-622f-443a-9004-eb87dce4f66f.png)
