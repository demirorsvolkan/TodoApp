// auth.js
export async function loginUser({ identifier, password }) {
  const response = await fetch('https://localhost:7299/api/Auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userName: identifier,  // burada identifier userName olarak gönderiliyor
      password: password
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || 'Giriş başarısız.');
  }

  const data = await response.json();
  return data;
}
// Kullanıcı adı var mı kontrol et
export async function checkUsernameExists(username) {
  const response = await fetch(`https://localhost:7299/api/Auth/username-exists?username=${encodeURIComponent(username)}`);
  
  if (!response.ok) {
    throw new Error('Kullanıcı adı kontrolü başarısız oldu.');
  }

  const exists = await response.json();
  return exists;  // true veya false
}

// Email var mı kontrol et
export async function checkEmailExists(email) {
  const response = await fetch(`https://localhost:7299/api/Auth/email-exists?email=${encodeURIComponent(email)}`);
  
  if (!response.ok) {
    throw new Error('Email kontrolü başarısız oldu.');
  }

  const exists = await response.json();
  return exists;  // true veya false
}