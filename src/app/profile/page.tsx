'use client';

import { Header } from '../../components/header';
import ProfileSettings from '../../components/profile/ProfileSettings';
import { ThemeProvider } from '../../context/ThemeContext';

export default function Profile() {
  return (
    <ThemeProvider>
      <Header />
      <ProfileSettings />
    </ThemeProvider>
  );
}
