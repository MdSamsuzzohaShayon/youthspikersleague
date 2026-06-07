// ⛏️⛏️ ALL OPERATIONS OF ADMIN ➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖➖
import React, { Component } from 'react';
import { Navigate } from 'react-router-dom';
import { hostname } from '../utils/global';
import Login from '../components/admin/Login';
import Loader from '../components/elements/Loader';
import '../style/Admin.css';
import withNavigate, { WithNavigateProps } from '../HOC/withNavigate';

interface AdminCredentials {
    email: string;
    password: string;
}


interface LoginError {
    msg: string;
}


interface AdminState {
    isLoading: boolean;
    credentials: AdminCredentials;
    errors: LoginError[];
    successMessage: string;
}


const INITIAL_STATE: AdminState = {
    isLoading: false,
    credentials: {
        email: '',
        password: '',
    },
    errors: [],
    successMessage: '',
};

const ERROR_MESSAGES = {
    INVALID_CREDENTIALS: 'Your email or password is invalid',
} as const;

class Admin extends Component<WithNavigateProps, AdminState> {
    constructor(props: WithNavigateProps) {
        super(props);

        this.state = { ...INITIAL_STATE };

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleLoginSubmit = this.handleLoginSubmit.bind(this);
    }

    // ⛏️⛏️ VALUE IS COMING FROM CHILD COMPONENT ==========================================================
    handleInputChange(event: React.ChangeEvent<HTMLInputElement>): void {
        const { name, value } = event.target;

        this.setState((prevState) => ({
            credentials: {
                ...prevState.credentials,
                [name]: value,
            },
        }));
    }

    // ⛏️⛏️ LOGIN ==========================================================
    private async authenticateAdmin(credentials: AdminCredentials): Promise<Response> {
        return fetch(`${hostname}/api/admin/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(credentials),
        });
    }

    private persistSession(accessToken: string, user: unknown): void {
        localStorage.setItem('token', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
    }

    private redirectToDashboard(): void {
        this.props.navigateToPath('/admin/dashboard');
    }

    private handleLoginSuccess(response: Response): void {
        response.json().then((data) => {
            this.persistSession(data.accessToken, data.user);
            this.redirectToDashboard();
        });
    }

    private handleLoginError(status: number): void {
        if (status === 400 || status === 401) {
            this.setState((prevState) => ({
                errors: [
                    ...prevState.errors,
                    { msg: ERROR_MESSAGES.INVALID_CREDENTIALS },
                ],
                successMessage: '',
            }));
        }
    }

    async handleLoginSubmit(event: React.FormEvent<HTMLFormElement>): Promise<void> {
        event.preventDefault();

        this.setState({ isLoading: true, errors: [] });

        try {
            const response = await this.authenticateAdmin(this.state.credentials);

            this.setState({ isLoading: false });

            if (response.ok) {
                this.handleLoginSuccess(response);
            } else {
                this.handleLoginError(response.status);
            }
        } catch (error) {
            this.setState({
                isLoading: false,
                errors: [
                    { msg: 'Network error occurred. Please try again.' },
                ],
            });

            console.error('Login attempt failed:', error);
        }
    }

    componentDidMount(): void {
        const token = localStorage.getItem('token');

        if (token) {
            this.redirectToDashboard();
        }
    }

    private getSavedToken(): string | null {
        return localStorage.getItem('token');
    }

    render(): React.ReactNode {
        const savedToken = this.getSavedToken();
        const { isLoading, credentials, errors, successMessage } = this.state;

        if (savedToken) {
            return <Navigate to="/admin/dashboard" replace />;
        }

        return (
            <div className="AdminIndex">
                {isLoading ? (
                    <Loader />
                ) : (
                    <Login
                        successMessage={successMessage}
                        onInputChange={this.handleInputChange}
                        errors={errors}
                        onLoginSubmit={this.handleLoginSubmit}
                    />
                )}
            </div>
        );
    }
}

export default withNavigate(Admin);