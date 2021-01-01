import logo from './logo.svg';
import './App.css';
import Accept from './components/Accept';

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        {/* <img src={logo} className='App-logo' alt='logo' /> */}
        <Accept />
      </header>
    </div>
  );
}

export default App;
