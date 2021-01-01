import './App.css';
import Accept from './components/Accept';

function gotAFile(event) {
  console.log(`got a file ${event}`);
}

function App() {
  return (
    <div className='App'>
      <header className='App-header'>
        <Accept myFileGetter={() => gotAFile} />
      </header>
    </div>
  );
}

export default App;
