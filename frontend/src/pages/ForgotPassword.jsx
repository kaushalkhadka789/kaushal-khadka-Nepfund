import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  useForgotPasswordMutation,
  useVerifyResetOtpMutation,
  useResetPasswordMutation,
} from '../services/api';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const ForgotPassword = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const [forgotPassword, { isLoading: isSendingOtp }] = useForgotPasswordMutation();
  const [verifyResetOtp, { isLoading: isVerifying }] = useVerifyResetOtpMutation();
  const [resetPassword, { isLoading: isResetting }] = useResetPasswordMutation();

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error(t('forgot.emailPlaceholder'));
      return;
    }

    try {
      await forgotPassword({ email }).unwrap();
      toast.success(t('forgot.sendOtp'));
      setStep(2);
    } catch (error) {
      toast.error(error.data?.message || t('home.error'));
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();

    if (!otp) {
      toast.error(t('forgot.otpPlaceholder'));
      return;
    }

    try {
      await verifyResetOtp({ email, otp }).unwrap();
      toast.success(t('forgot.verify'));
      setStep(3);
    } catch (error) {
      toast.error(error.data?.message || t('home.error'));
    }
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    if (!newPassword || newPassword.length < 6) {
      toast.error(t('register.passwordPlaceholder'));
      return;
    }

    try {
      await resetPassword({ email, newPassword }).unwrap();
      toast.success(t('forgot.reset'));
      navigate('/login');
    } catch (error) {
      toast.error(error.data?.message || t('home.error'));
    }
  };

  const handleResendOtp = async () => {
    if (!email) {
      toast.error(t('forgot.emailPlaceholder'));
      return;
    }
    try {
      await forgotPassword({ email }).unwrap();
      toast.success(t('forgot.sendOtp'));
    } catch (error) {
      toast.error(error.data?.message || t('home.error'));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            {step === 1 && t('forgot.title')}
            {step === 2 && t('forgot.verifyTitle')}
            {step === 3 && t('forgot.resetTitle')}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
              {t('forgot.backToLogin')}
            </Link>
          </p>
        </div>

        {step === 1 && (
          <form className="mt-8 space-y-6" onSubmit={handleSendOtp}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="email" className="sr-only">
                  {t('login.email')}
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('forgot.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSendingOtp}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isSendingOtp ? t('forgot.sendingOtp') : t('forgot.sendOtp')}
              </button>
            </div>
          </form>
        )}

        {step === 2 && (
          <form className="mt-8 space-y-6" onSubmit={handleVerifyOtp}>
            <p className="text-sm text-gray-600">
              {t('forgot.otpHelp', { email })}
            </p>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="otp" className="sr-only">
                  'OTP'
                </label>
                <input
                  id="otp"
                  name="otp"
                  type="text"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('forgot.otpPlaceholder')}
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={isSendingOtp}
                className="text-sm font-medium text-primary-600 hover:text-primary-500 disabled:opacity-50"
              >
                {t('forgot.resend')}
              </button>
            </div>

            <div>
              <button
                type="submit"
                disabled={isVerifying}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isVerifying ? t('forgot.verifying') : t('forgot.verify')}
              </button>
            </div>
          </form>
        )}

        {step === 3 && (
          <form className="mt-8 space-y-6" onSubmit={handleResetPassword}>
            <div className="rounded-md shadow-sm -space-y-px">
              <div>
                <label htmlFor="newPassword" className="sr-only">
                  {t('register.password')}
                </label>
                <input
                  id="newPassword"
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-primary-500 focus:border-primary-500 focus:z-10 sm:text-sm"
                  placeholder={t('forgot.newPasswordPlaceholder')}
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isResetting}
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                {isResetting ? t('forgot.resetting') : t('forgot.reset')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;


