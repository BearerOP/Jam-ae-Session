

const SignupForm = () => {
    return (
        <div>
            <h1>Signup</h1>
            <form>
                <label htmlFor="email">Email</label>
                <input type="email" id="email" name="email" />
                <label htmlFor="password">Password</label>
                <input type="password" id="password" name="password" />
                <button type="submit">Signup</button>
            </form>
        </div>
    );
};
export default SignupForm;