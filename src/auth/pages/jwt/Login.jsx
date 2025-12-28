// ✅ Login.jsx (fixed)
import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import * as Yup from 'yup';
import { useFormik } from 'formik';
import { KeenIcon } from '@/components';
import { useAuthContext } from '@/auth';
import { useLayout } from '@/providers';
import { Alert } from '@/components';

const loginSchema = Yup.object().shape({
  email: Yup.string().email('Wrong email format').min(3).max(50).required('Email is required'),
  password: Yup.string().min(3).max(50).required('Password is required'),
  remember: Yup.boolean()
});

const initialValues = {
  email: '',
  password: '',
  remember: false
};

const Login = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthContext();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';
  const [showPassword, setShowPassword] = useState(false);
  const { currentLayout } = useLayout();

  const formik = useFormik({
    initialValues,
    validationSchema: loginSchema,
    onSubmit: async (values, { setStatus, setSubmitting }) => {
      setLoading(true);
      try {
        if (!login) throw new Error('JWTProvider is required for this form.');

        console.log('Submitting login with email:', values.email, 'password:', values.password);
        await login(values.email, values.password);

        if (values.remember) {
          localStorage.setItem('email', values.email);
        } else {
          localStorage.removeItem('email');
        }

        navigate(from, { replace: true });
      } catch (error) {
        const message = error?.response?.data?.message || error?.message || 'Login failed';
        console.error('Login form error:', message);
        setStatus(message);
        setSubmitting(false);
        setLoading(false);
      }
    }
  });

  const togglePassword = event => {
    event.preventDefault();
    setShowPassword(!showPassword);
  };

  return (
    <div className="card max-w-[400px] dark:border-gray-200 dark:bg-gray-200 p-10 w-full flex justify-center items-center">
      <form className="card-body flex justify-center w-full flex-col gap-5 p-0" onSubmit={formik.handleSubmit} noValidate>
        <h3 className="text-lg text-center font-semibold text-gray-900 leading-none mb-2.5">Sign in</h3>

        {formik.status && <Alert variant="danger">{formik.status}</Alert>}

        <div className="flex flex-col gap-1">
          <label className="form-label text-gray-900">Email</label>
          <label className="input">
            <input
              placeholder="Enter email"
              autoComplete="off"
              {...formik.getFieldProps('email')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.email && formik.errors.email
              })}
            />
          </label>
          {formik.touched.email && formik.errors.email && (
            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.email}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between gap-1">
            <label className="form-label text-gray-900">Password</label>
            <Link to={currentLayout?.name === 'auth-branded' ? '/auth/reset-password' : '/auth/classic/reset-password'} className="text-2sm link shrink-0">
              Forgot Password?
            </Link>
          </div>
          <label className="input">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Enter Password"
              autoComplete="off"
              {...formik.getFieldProps('password')}
              className={clsx('form-control', {
                'is-invalid': formik.touched.password && formik.errors.password
              })}
            />
            <button className="btn btn-icon" onClick={togglePassword}>
              <KeenIcon icon="eye" className={clsx('text-gray-500', { hidden: showPassword })} />
              <KeenIcon icon="eye-slash" className={clsx('text-gray-500', { hidden: !showPassword })} />
            </button>
          </label>
          {formik.touched.password && formik.errors.password && (
            <span role="alert" className="text-danger text-xs mt-1">{formik.errors.password}</span>
          )}
        </div>

        <label className="checkbox-group">
          <input className="checkbox checkbox-sm" type="checkbox" {...formik.getFieldProps('remember')} />
          <span className="checkbox-label">Remember me</span>
        </label>

        <button type="submit" className="btn btn-primary flex justify-center" disabled={loading || formik.isSubmitting}>
          {loading ? 'Please wait...' : 'Sign In'}
        </button>
      </form>
    </div>
  );
};

export { Login };