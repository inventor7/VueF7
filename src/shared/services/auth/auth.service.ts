export class Auth {
  async isLoggedIn(): Promise<boolean> {
    const token = localStorage.getItem("userToken");
    if (!token) return false;
    return true;
  }

  async getUserRoles(): Promise<string[]> {
    const roles = localStorage.getItem("userRoles");
    return roles ? JSON.parse(roles) : [];
  }

  async login(
    username: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const mockUser = {
        username,
        password,
        roles: ["user"],
      };

      localStorage.setItem("userToken", "mock-token-" + Date.now());
      localStorage.setItem("userRoles", JSON.stringify(mockUser.roles));

      return { success: true };
    } catch (error) {
      console.log(error);
      return { success: false, error: "Login failed" };
    }
  }

  logout(): void {
    localStorage.removeItem("userToken");
    localStorage.removeItem("userRoles");
  }
}
