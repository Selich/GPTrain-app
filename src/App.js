import { ChakraProvider } from "@chakra-ui/react";
import { createContext, useContext, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes,
  redirect,
} from "react-router-dom";
import Login from "./components/Login";
import Main from "./components/Main";

function App() {
  const fakeAuth = {
    isAuthenticated: false,
    signin(cb) {
      fakeAuth.isAuthenticated = true;
      setTimeout(cb, 100); // fake async
    },
    signout(cb) {
      fakeAuth.isAuthenticated = false;
      setTimeout(cb, 100);
    },
  };

  const authContext = createContext();

  const useAuth = () => {
    return useContext(authContext);
  };

  const useProvideAuth = () => {
    const [user, setUser] = useState(null);

    const signin = (cb) => {
      return fakeAuth.signin(() => {
        setUser("user");
        cb();
      });
    };

    const signout = (cb) => {
      return fakeAuth.signout(() => {
        setUser(null);
        cb();
      });
    };

    return {
      user,
      signin,
      signout,
    };
  };

  const PrivateRoute = ({ children, ...rest }) => {
    let auth = useAuth();
    return (
      <Route
        {...rest}
        render={({ location }) => (auth.user ? children : redirect)}
      />
    );
  };

  const ProvideAuth = ({ children }) => {
    const auth = useProvideAuth();
    return <authContext.Provider value={auth}>{children}</authContext.Provider>;
  };

  return (
    <ChakraProvider>
      <ProvideAuth>
        <Router>
          <Routes>
            <Route path="/" element={<Main />} />
            <Route path="/login" element={<Login />} />
          </Routes>
        </Router>
      </ProvideAuth>
    </ChakraProvider>
  );
}

// {/* // <img width="500px" height="500px" src={url} alt="webcam" /> */}
export default App;
