export async function verifyToken(token) {
  const response = await fetch('https://localhost:7299/api/Task/verify', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });

  if (!response.ok) {
    if (response.status === 401) {
      console.log("Geçersiz token");
      throw new Error('Geçersiz token');
    }
    console.log("Doğrulama hatası");
    throw new Error('Doğrulama hatası');
  }

  const userData = await response.json();  // user bilgisi döndüğünü varsayıyoruz
  console.log("Token geçerli, kullanıcı bilgisi geldi:", userData);
  return userData;
}
