import { NextFunction, Response, Request } from 'express';
import AuthService from './auth.service';

class AuthController {
  private static getCookieOptions() {
    const isProduction = process.env.NODE_ENV === 'production';

    if (isProduction) {
      // For production, try both strategies to maximize compatibility
      return {
        httpOnly: true,
        secure: true,
        sameSite: 'none' as const,
        path: '/',
        // Only set domain if explicitly configured, otherwise let browser handle it
        ...(process.env.COOKIE_DOMAIN && { domain: process.env.COOKIE_DOMAIN }),
      };
    } else {
      // Development settings
      return {
        httpOnly: true,
        secure: false,
        sameSite: 'lax' as const,
        path: '/',
      };
    }
  }
  static setCookies(payload: {
    res: Response;
    token: string;
    refreshToken: string;
    rememberMe?: boolean;
  }) {
    const { res, token, refreshToken, rememberMe } = payload;
    const cookieOptions = AuthController.getCookieOptions();
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');

    // Primary cookie strategy
    res.cookie('accessToken', token, {
      ...cookieOptions,
      path: '/',
      maxAge: 10 * 60 * 1000, // 10 minutes
    });

    res.cookie('refreshToken', refreshToken, {
      ...cookieOptions,
      path: '/api/auth/refresh',
      maxAge: rememberMe ? 30 * 24 * 60 * 60 * 1000 : 7 * 24 * 60 * 60 * 1000, // 7 or 30 days
    });
  }

  static async credentialsSignIn(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const { token, refreshToken, user, rememberMe } =
        await AuthService.credentialsSignIn(req.body);
      AuthController.setCookies({ res, token, refreshToken, rememberMe });
      res.status(200).json(user);
    } catch (error) {
      next(error);
    }
  }

  static async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      res.status(200).json(req.user);
    } catch (error) {
      next(error);
    }
  }

  static async refreshToken(req: Request, res: Response, next: NextFunction) {
    try {
      const { token, refreshToken } = await AuthService.refreshToken(
        req.cookies.refreshToken,
      );
      AuthController.setCookies({ res, token, refreshToken });
      res.status(200).json({ message: 'Token refreshed' });
    } catch (error) {
      next(error);
    }
  }

  static async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user.id;
      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');
      await AuthService.signOut(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  }

  static async forgotPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.forgotPassword(req.body);
      res.status(200).json({
        message:
          'If an account with that email exists, a password reset link has been sent',
      });
    } catch (err) {
      next(err);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.resetPassword(req.body);
      res.status(200).json({ message: 'Password reset successful' });
    } catch (err) {
      next(err);
    }
  }

  static async disableUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.blockUser(req.body.email);
      res.status(200).json({ message: 'User disabled successfully' });
    } catch (error) {
      next(error);
    }
  }

  static async enableUser(req: Request, res: Response, next: NextFunction) {
    try {
      await AuthService.activateUser(req.body.email);
      res.status(200).json({ message: 'User enabled successfully' });
    } catch (error) {
      next(error);
    }
  }
}

export default AuthController;
