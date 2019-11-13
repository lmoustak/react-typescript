import React, { useState } from 'react';

const Counter: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [step, setStep] = useState(1);

  const handleIncrementClick = () => setCounter(prevCounter => prevCounter + step);
  const handleDecrementClick = () => setCounter(prevCounter => prevCounter - step);
  const handleResetClick = () => setCounter(0);

  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => setStep(event.target.valueAsNumber || 1);

  return (
    <div className="row mt-5">
      <div className="col-4"></div>
      <div className="col-4">
        <p>Current counter value: {counter}</p>
        <button className="btn btn-primary btn-sm" onClick={handleResetClick}>Reset</button>
        <form className="form-group mt-5">
          <label>Step value: <input type="number" className="form-control" min="1" value={step} onChange={handleStepChange}/></label>
        </form>
        {
          !isNaN(step) &&
          (
            <div>
              <button type="button" className="btn btn-primary mr-3" onClick={handleIncrementClick}>Increment by {step}</button>
              <button type="button" className="btn btn-primary" onClick={handleDecrementClick}>Decrement by {step}</button>
            </div>
          )
        }
      </div>
      <div className="col-4"></div>
    </div>
  );
}

export default Counter;