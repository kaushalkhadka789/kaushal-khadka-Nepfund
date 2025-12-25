import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation } from '../services/api';
import { useDispatch } from 'react-redux';
import { setCredentials } from '../store/authSlice';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [register, { isLoading }] = useRegisterMutation();

  const [showPassword, setShowPassword] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await register(formData).unwrap();
      dispatch(setCredentials(result));
      toast.success('Registration successful!');
      navigate('/');
    } catch (error) {
      toast.error(error.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* LEFT IMAGE SECTION */}
      <div className="hidden md:block md:w-5/12 bg-gray-200 rounded-r-3xl overflow-hidden ml-10">
        <img
          src="create.jpg"
          alt="Register Banner"
          className="w-full h-full object-cover"
        />
      </div>


      {/* RIGHT FORM SECTION */}
      <div className="flex w-full md:w-1/2 items-center justify-center px-6 md:px-10 lg:px-14 py-12">
        <div className="w-full max-w-lg bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-gray-100 px-6 py-8 sm:px-8 sm:py-10">

          <div className="text-center mb-8 space-y-2">
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              {t('register.title')}
            </h2>
            <p className="text-sm text-gray-500">
              {t('login.or')}{' '}
              <Link
                to="/login"
                className="font-semibold text-primary-600 hover:text-primary-500 transition-colors"
              >
                {t('register.signIn')}
              </Link>
            </p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">

              {/* NAME */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 text-left">
                  {t('register.name')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5.121 17.804A8 8 0 1118.88 7.196M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M5.121 17.804A8 8 0 0112 15a8 8 0 016.879 2.804" />
                    </svg>
                  </span>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-2xl border border-gray-200 bg-white px-11 py-2.5 text-sm"
                    placeholder={t('register.namePlaceholder')}
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 text-left">
                  {t('register.email')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-2xl border border-gray-200 bg-white px-11 py-2.5 text-sm"
                    placeholder={t('register.email')}
                  />
                </div>
              </div>

              {/* PASSWORD */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 text-left">
                  {t('register.password')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="block w-full rounded-2xl border border-gray-200 bg-white px-11 pr-11 py-2.5 text-sm"
                    placeholder={t('register.passwordPlaceholder')}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? '👁️‍🗨️' : '👁️'}
                  </button>
                </div>
              </div>

              {/* PHONE */}
              <div className="space-y-1.5">
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 text-left">
                  {t('register.phone')}
                </label>
                <div className="relative">
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-gray-400">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M3 5h2l3 10h8l3-10h2M5 5V3h4v2" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6} d="M7 15a5 5 0 0010 0" />
                    </svg>
                  </span>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    className="block w-full rounded-2xl border border-gray-200 bg-white px-11 py-2.5 text-sm"
                    placeholder={t('register.phonePlaceholder')}
                  />
                </div>
              </div>

              {/* ADDRESS */}
              <div className="space-y-1.5">
                <label htmlFor="address" className="block text-sm font-medium text-gray-700 text-left">
                  {t('register.address')}
                </label>
                <input
                  id="address"
                  name="address"
                  type="text"
                  value={formData.address}
                  onChange={handleChange}
                  className="block w-full rounded-2xl border border-gray-200 bg-white px-4 py-2.5 text-sm"
                  placeholder={t('register.addressPlaceholder')}
                />
              </div>

            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-2xl bg-primary-600 text-white py-2.5 text-sm font-semibold shadow-md hover:bg-primary-700 transition disabled:opacity-60"
            >
              {isLoading ? t('register.creating') : t('register.submit')}
            </button>

          </form>

        </div>
      </div>

    </div>
  );
};

export default Register;
