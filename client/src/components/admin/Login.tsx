import React from 'react';

interface ErrorMessage {
  msg: string;
}

interface LoginProps {
  errors: ErrorMessage[];
  successMessage: string;
  onInputChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onLoginSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}

const Login: React.FC<LoginProps> = ({
  errors,
  successMessage,
  onInputChange,
  onLoginSubmit,
}) => {
  const renderErrorMessages = (): React.ReactNode => {
    if (errors.length === 0) return null;

    return errors.map((error, index) => (
      <div className="alert alert-danger" key={`error-${index}`} role="alert">
        {error.msg}
      </div>
    ));
  };

  const renderSuccessMessage = (): React.ReactNode => {
    if (!successMessage) return null;

    return (
      <div className="alert alert-success" role="alert">
        {successMessage}
      </div>
    );
  };

  const handleFormSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onLoginSubmit(event);
  };

  return (
    <div className="Login">
      {/* LOGIN ADMIN */}
      {renderErrorMessages()}
      {renderSuccessMessage()}

      <form className="login-admin" onSubmit={handleFormSubmit}>
        <h2 className="text-primary">Login</h2>

        <div className="mb-3">
          <label htmlFor="loginEmail" className="form-label">
            Email
          </label>
          <input
            id="loginEmail"
            type="email"
            name="email"
            className="form-control"
            placeholder="name@example.com"
            onChange={onInputChange}
            required
            autoComplete="email"
          />
        </div>

        <div className="mb-3">
          <label htmlFor="loginPassword" className="form-label">
            Password
          </label>
          <input
            id="loginPassword"
            type="password"
            name="password"
            className="form-control"
            autoComplete="current-password"
            placeholder="******"
            onChange={onInputChange}
            required
          />
        </div>

        <div className="mb-3">
          <button type="submit" className="btn btn-primary">
            Submit
          </button>
        </div>
      </form>
    </div>
  );
};

export default Login;