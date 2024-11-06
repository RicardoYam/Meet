import ProfilePage from "./pages/ProfilePage";

<Routes>
  {/* ... other routes ... */}
  <Route path="/profile" element={<ProfilePage />} />
  <Route path="/profile/:username" element={<ProfilePage />} />
</Routes>;
