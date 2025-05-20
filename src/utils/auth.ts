export function isUserSignedIn(): boolean {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  return !!token && !!user;
}

export function logout() {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  sessionStorage.removeItem('user');
  sessionStorage.removeItem('token');
}
