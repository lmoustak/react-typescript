import React, { useState } from 'react';
import { Row, Col, Button, FormGroup, Label, Input } from 'reactstrap';

const Counter: React.FC = () => {
  const [counter, setCounter] = useState(0);
  const [step, setStep] = useState(1);


  const handleIncrementClick = () => setCounter(prevCounter => prevCounter + step);
  const handleDecrementClick = () => setCounter(prevCounter => prevCounter - step);
  const handleResetClick = () => setCounter(0);

  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => setStep(event.target.valueAsNumber || 1);

  return (
    <Row className="mt-5">
      <Col xs={12} md={{size: 4, offset: 4}}>
        <p>Current counter value: {counter}</p>
        <Button color="primary" size="sm" onClick={handleResetClick}>Reset</Button>
        <FormGroup className="mt-5">
          <Label>Step value: <Input type="number" name="step" className="form-control" min="1" value={step} onChange={handleStepChange}/></Label>
        </FormGroup>
        {
          !isNaN(step) &&
          (
            <div>
              <Button color="primary" size="sm" className="mr-3" onClick={handleIncrementClick}>Increment by {step}</Button>
              <Button color="primary" size="sm" onClick={handleDecrementClick}>Decrement by {step}</Button>
            </div>
          )
        }
      </Col>
    </Row>
  );
}

export default Counter;