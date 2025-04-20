export function isUserSignedIn(): boolean {
  const user = localStorage.getItem('user') || sessionStorage.getItem('user');
  const token =
    localStorage.getItem('token') || sessionStorage.getItem('token');

  return !!token && !!user;
}
