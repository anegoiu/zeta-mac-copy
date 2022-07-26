import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Button from 'react-bootstrap/Button';
import 'bootstrap/dist/css/bootstrap.min.css';

let INTERVAL_TIME;

class Game extends React.Component{
  constructor(props){
    super(props);
    INTERVAL_TIME = 60;
    this.state = {
      "result": "",
       "expression": [createExpression()],
       "score": 0,
       "time": INTERVAL_TIME,
       "display": "expression",
       "duration": [Date.now()]
      };
   
    this.handleChangeTextBox = this.handleChangeTextBox.bind(this);
    this.handleRestart = this.handleRestart.bind(this)
    this.startTimer();
  }

  startTimer(){
    var timer = setInterval(() => {
      const currTime = this.state.time - 1;
      if (currTime <= 1){
        clearInterval(timer);
        const prevHighscore = Number.parseInt(window.localStorage.getItem("score"));
        if (prevHighscore < this.state.score) {
        window.localStorage.setItem("score", this.state.score.toString())
        }
        this.setState({"time": 0})
      }
      else{
      this.setState({"time" : currTime});
      }
    }, 1000);
  }

  handleChangeTextBox(e){
    if(this.state.time === 0){
      this.setState({
        "result": "",
        "display": "result",
      });
      return;
    }
    let num = Number.parseInt(e.target.value)
    if (Number.isNaN(num)){
      this.setState({"result": ""});
      return;
    }
    if(num === this.state.expression[this.state.expression.length - 1][1]){
      const len = this.state.duration.length - 1;
      let duration = this.state.duration;
      console.log(Date.now())
      console.log(duration)
      duration[len] = Date.now() - duration[len];
      duration = duration.concat([Date.now()])
     const  currExpression = this.state.expression.concat([createExpression()]);
      console.log(currExpression)
      this.setState({
        "result": "",
        "expression": currExpression,
        "score" : this.state.score + 1,
        "duration": duration

      });
      console.log(duration);
    }
    else {
      this.setState({"result": num});
    }
  }

  handleRestart(){
    this.setState({
      "time": INTERVAL_TIME,
      "score": 0,
      "result": "",
      "display": "expression",
      "expression": [createExpression()],
      "duration": [Date.now()]
    });
    var timer = setInterval(() => {
      this.setState({"time" : this.state.time -1});
      if (this.state.time <= 0){
        clearInterval(timer);
        this.setState({"time": 0})
      }
    }, 1000);
  }

  render(){
    let centerPiece;
    console.log(`inside render: full expression = ${this.state.expression}`)
    console.log(`expression = ${this.state.expression[this.state.expression[this.state.expression.length -1][0]]}`)
    switch(this.state.display){
      case "expression":
        centerPiece =  <ExpressionBox
      expression = {this.state.expression[this.state.expression.length - 1][0]}
      result = {this.state.result}
      onChange = {this.handleChangeTextBox} />;
        break;
      case "result":
        centerPiece = <Result 
          onClickRestart={this.handleRestart} 
          onClickHistory={()=> this.setState({"display": "history"})} 
          score={this.state.score}/>
        break;
      case "history":
        centerPiece = <History 
          expression={this.state.expression} 
          duration={this.state.duration} 
          onClickRestart={this.handleRestart}
          onClickScore={() => this.setState({"display": "result"})}
          /> ;
        break;
      default :
        centerPiece = <p>Something went wrong! Expression: {this.state.display}.</p>
    }
    return (
      <div className= "canvas">
        <Stats time={this.state.time} score={this.state.score}></Stats>
        <div className= "game">
        {centerPiece}
        </div>
      </div>
    );
  }
}

class Stats extends React.Component{
  render() {
    return (
    <div className = "stats">
      <Button variant="light" >{this.props.time}</Button>
      <Button variant="light" > Score:{this.props.score}</Button>
    </div> 
    );
  }

}

class ExpressionBox extends React.Component{
  render(){
    return (
      <form className= "textbox-form"> 
        <label> {this.props.expression}
        <input type="text" value={this.props.result} onChange={this.props.onChange}></input>
        </label>
      </form>
    );
  }
}

class Result extends React.Component{
  render(){
    return (
      <div className= "display">
        <p>Score: {this.props.score}<br></br>
            Highscore: {window.localStorage.getItem("score")}
        </p>
        <div className = "restart-options">
          <Button variant="light" onClick= {this.props.onClickRestart}>Restart</Button>
          <Button variant="light" onClick = {this.props.onClickHistory}>History</Button>
        </div>
      </div>
    );
  }
}

class History extends React.Component{
  render(){
    let expressions = this.props.expression
    expressions.pop()
    let durations = this.props.duration
    console.log(`expressions: ${expressions}`)
    console.log(`durations: ${durations}`)
    console.log(`${expressions.length} == ${durations.length}`)
    const zipped =  expressions.map((x, i) => [x, durations[i]]);
    let elements = zipped.map((zip) => 
        <li>{zip[0][0]} {zip[0][1]} => {(zip[1]/1000).toFixed(2)} s</li>
    );
    return (
      <div className= "history">
        <div className = "restart-options">
          <Button variant="light" onClick= {this.props.onClickRestart}>Restart</Button>
          <Button variant="light" onClick= {this.props.onClickScore}>Score</Button>
        </div>
        <h3>History</h3>
        <ul>{elements}</ul> 
      </div>
    );
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
  <Game/>
  </React.StrictMode>
);

const operations = ["+","-","*", "/"];
const range = {
  multiplication_range :[{start: 2, end: 12}, {start: 2, end:100}],
  addition_range : [{start: 2, end: 100}, {start: 2, end:100}]
};

function chooseOperation(){
  const op_index = Math.floor(Math.random()*4);
  console.log(`op_index: ${op_index} => the operation is: ${operations[op_index]}`);
  return operations[op_index];
}

function getNums(array){
  // how do you get these st the same time
  const first_num_start = (range[array][0]["start"]);
  const first_num_end =  (range[array][0]["end"]);
  const first_num = Math.floor(Math.random()*(first_num_end -  first_num_start)) + first_num_start;
  const second_num_start = range[array][1]["start"];
  const second_num_end = range[array][1]["end"];
  const second_num = Math.floor(Math.random()*(second_num_end -  second_num_start)) + first_num_start;
  return [first_num,second_num]
}

function createExpression(){
  // how do you get these st the same time
  const op = chooseOperation();
  let array = op === ("+" || "-") ? "addition_range" : "multiplication_range";
  let [first_num,second_num] = getNums(array);
  console.log(`array: ${array}\n nums: (${first_num},${second_num})`);
  let exp,ans;
  switch (op){
    case "+":
      exp = `${first_num} + ${second_num} = `;
      ans = first_num + second_num;
      break;
    case "-":
      exp = `${first_num + second_num} - ${first_num} = `;
      ans = second_num;
      break;
    case "*":
      exp = `${first_num} * ${second_num} = `;
      ans = first_num * second_num;
      break;
    case "/":
      exp = `${first_num * second_num} / ${first_num} = `;
      ans = second_num;
      break;  
    default:
      exp = `Something went wrong!`;
      ans = -1;
  }
  return [exp,ans];
}

console.log(createExpression());
