import { ChakraProvider } from "@chakra-ui/react";
import { createContext, useState } from "react";
import {
  Route,
  BrowserRouter as Router,
  Routes
} from "react-router-dom";
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
          </Routes>
        </Router>
      </ProvideAuth>
    </ChakraProvider>
  );
}

export default App;
