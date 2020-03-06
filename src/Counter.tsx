import React, { useState } from 'react';
import { Row, Col, Button, Form } from 'react-bootstrap';
import { AnimatedValue } from 'react-spring';

const Counter: React.FC<{ themeProps: AnimatedValue<any> }> = ({ themeProps }) => {
  const [counter, setCounter] = useState(0);
  const [step, setStep] = useState(1);


  const handleIncrementClick = () => setCounter(prevCounter => prevCounter + step);
  const handleDecrementClick = () => setCounter(prevCounter => prevCounter - step);
  const handleResetClick = () => setCounter(0);

  const handleStepChange = (event: React.ChangeEvent<HTMLInputElement>) => setStep(event.target.valueAsNumber || 1);

  return (
    <Row className="pt-5">
      <Col xs md={{span: 4, offset: 4}}>
        <p>Current counter value: {counter}</p>
        <Button color="primary" size="sm" onClick={handleResetClick}>Reset</Button>
        <Form.Group className="mt-5">
          <Form.Label>Step value: <Form.Control type="number" name="step" style={themeProps} min="1" value={step.toString()} onChange={handleStepChange}/></Form.Label>
        </Form.Group>
        {
          !isNaN(step) && (
            <div>
              <Button color="success" size="sm" className="mr-3" onClick={handleIncrementClick}>Increment by {step}</Button>
              <Button color="danger" size="sm" onClick={handleDecrementClick}>Decrement by {step}</Button>
            </div>
          )
        }
      </Col>
    </Row>
  );
}

export default Counter;