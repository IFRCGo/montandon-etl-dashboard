import { useState } from 'react';
import {
    gql,
    useMutation,
} from '@apollo/client';
import {
    Button,
    Container,
    PasswordInput,
    TextInput,
} from '@ifrc-go/ui';

import {
    type LoginMutation,
    type LoginMutationVariables,
} from '#generated/types/graphql';
import useAlert from '#hooks/useAlert';

import styles from './styles.module.css';

const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            id
            email
            firstName
            lastName
            displayName
        }
    }
`;

interface Props {
    onLoggedIn: (user: NonNullable<LoginMutation['login']>) => void;
}

function Login(props: Props) {
    const { onLoggedIn } = props;

    const [email, setEmail] = useState<string | undefined>();
    const [password, setPassword] = useState<string | undefined>();
    const alert = useAlert();

    const [login, { loading }] = useMutation<LoginMutation, LoginMutationVariables>(
        LOGIN,
        {
            onCompleted: (response) => {
                if (response?.login) {
                    onLoggedIn(response.login);
                } else {
                    alert.show(
                        'Invalid email or password.',
                        { variant: 'danger' },
                    );
                }
            },
            onError: () => {
                alert.show(
                    'Invalid email or password.',
                    { variant: 'danger' },
                );
            },
        },
    );

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!email || !password) {
            return;
        }
        login({ variables: { username: email, password } });
    };

    return (
        <div className={styles.login}>
            <Container
                className={styles.loginContainer}
                heading="Montandon ETL Monitoring Dashboard"
                withHeaderBorder
            >
                <form
                    className={styles.form}
                    onSubmit={handleSubmit}
                >
                    <TextInput
                        name="email"
                        label="Email"
                        type="text"
                        value={email}
                        onChange={setEmail}
                        autoFocus
                    />
                    <PasswordInput
                        name="password"
                        label="Password"
                        value={password}
                        onChange={setPassword}
                    />
                    <Button
                        name={undefined}
                        type="submit"
                        variant="primary"
                        disabled={loading || !email || !password}
                    >
                        Log in
                    </Button>
                </form>
            </Container>
        </div>
    );
}

export default Login;
