import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState(null)

  // 1. 배포 환경이면 Render 주소를, 로컬이면 localhost를 사용하도록 설정
  const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

  useEffect(() => {
    // 2. 주소 뒤에 슬래시(/)가 중복되지 않도록 확인하세요.
    // 만약 FastAPI의 경로가 @app.get("/health") 라면 아래처럼 호출합니다.
    fetch(`${API_URL}/health`)
      .then(res => {
        if (!res.ok) throw new Error("네트워크 응답 에러");
        return res.json();
      })
      .then(result => {
        // 3. FastAPI 응답 형태에 맞춰 필드명을 확인하세요 (예: result.status 또는 result.message)
        setData(result.status || result.message || "연결 성공");
      })
      .catch(err => {
        console.error("연결 에러:", err);
        setData("연결 실패");
      });
  }, []); // 의존성 배열이 빈 배열이므로 마운트 시에만 실행됨

  return (
    <div>
      <h1>백엔드 연결 상태:</h1>
      <p>{data ? data : "로딩 중..."}</p>
    </div>
  )
}

export default App