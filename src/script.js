const isOperator = /[x/+‑]/,
  endsWithOperator = /[x+‑/]$/;

class Calculator extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      currentVal: '0',
      prevVal: '0',
      formula: '',
      currentSign: 'pos',
      lastClicked:   
 ''
    }
    this.toggleToNegative = this.toggleToNegative.bind(this);
    this.toggleToPositive = this.toggleToPositive.bind(this);
    this.lockOperators = this.lockOperators.bind(this);
    this.maxDigitWarning = this.maxDigitWarning.bind(this);
    this.handleOperators = this.handleOperators.bind(this);
    this.handleEvaluate = this.handleEvaluate.bind(this);
    this.handleToggleSign = this.handleToggleSign.bind(this);
    this.initialize = this.initialize.bind(this);
    this.handleCE = this.handleCE.bind(this);
    this.handleDecimal = this.handleDecimal.bind(this);
    this.handleNumbers = this.handleNumbers.bind(this);   

  }

  toggleToNegative(formula, currentVal) {
    this.setState({
      currentVal: '-' + this.state.formula.match(/(\d*\.?\d*)$/)[0],
      formula: formula.replace(/(\d*\.?\d*)$/,   

        '(-' + this.state.formula.match(/(\d*\.?\d*)$/)[0]),
      currentSign: 'neg'
    });
  }

  toggleToPositive(formula, lastOpen, currentVal) {
    this.setState({
      currentSign: 'pos'
    });
    if (this.state.lastClicked == 'CE') {
      this.setState({
        currentVal: this.state.formula.match(/(\d+\.?\d*)$/)[0],
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen + 2),
      });
    } else if (currentVal == '-') {
      this.setState({
        currentVal: '0',
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen + 2),
      });
    } else {
      this.setState({
        currentVal: currentVal.slice(currentVal.indexOf('-') + 1),
        formula: formula.substring(0, lastOpen) +
          formula.substring(lastOpen   
 + 2),
      });
    }
  }

  lockOperators(formula, currentVal) {
    return formula.lastIndexOf('.') == formula.length - 1 ||
      formula.lastIndexOf('-') == formula.length - 1 ||
      currentVal.indexOf('Met') != -1
  }

  maxDigitWarning() {
    this.setState({
      currentVal: 'Digit Limit Met',
      prevVal: this.state.currentVal
    });
    setTimeout(() => this.setState({
      currentVal: this.state.prevVal
    }), 1000)
  }

  handleEvaluate() {
    if (!this.lockOperators(this.state.formula, this.state.currentVal)) {
      let expression = this.state.formula;
      if   
 (endsWithOperator.test(expression)) expression = expression.slice(0, -1);
      expression = expression.replace(/x/g, "*").replace(/‑/g, "-");
      expression = expression.lastIndexOf('(') > expression.lastIndexOf(')') ?
        expression + ')' : expression;
      let answer = Math.round(1000000000000   
 * eval(expression)) / 1000000000000;
      this.setState({
        currentVal:   
 answer.toString(),
        formula: expression.replace(/\*/g, '⋅').replace(/-/g, '‑') + '=' + answer,
        prevVal: answer,
        currentSign: answer[0] == '-' ? 'neg' : 'pos',
        lastClicked: 'evaluated'
      });
    }
  }

  handleOperators(e) {
    if (!this.lockOperators(this.state.formula, this.state.currentVal))   
 {
      const newOperator = e.target.value;
      let { formula } = this.state;
      if (endsWithOperator.test(formula)) {
        if (newOperator === '-') {
          formula += newOperator;
        } else {
          formula = formula.slice(0, -1) + newOperator; 
        }
      } else if (this.state.formula.lastIndexOf('(') > this.state.formula.lastIndexOf(')')) {
        formula += ')' + newOperator;
      } else if (this.state.formula.indexOf('=') != -1) {
        formula = this.state.prevVal + newOperator; 
      } else {
        formula += newOperator;
      }

      this.setState({
        prevVal: !isOperator.test(this.state.currentVal) ? this.state.formula : this.state.prevVal,
        formula: formula,
        currentSign: 'pos',
        currentVal: newOperator,
        lastClicked: 'operator'
      });
    }
  }
  handleToggleSign() {
    this.setState({
      lastClicked: 'toggleSign'
    });
    if (this.state.lastClicked == 'evaluated') {
      this.setState({
        currentVal: this.state.currentVal.indexOf('-') > -1 ?
          this.state.currentVal.slice(1) : '-' + this.state.currentVal,
        formula: this.state.currentVal.indexOf('-') > -1 ?
          this.state.currentVal.slice(1) : '(-' + this.state.currentVal,
        currentSign: this.state.currentVal.indexOf('-') > -1 ?
          'pos' : 'neg',
      });
    } else if (this.state.currentSign == 'neg') {
      this.toggleToPositive(
        this.state.formula,
        this.state.formula.lastIndexOf('(-'),
        this.state.currentVal)
    } else {
      this.toggleToNegative(
        this.state.formula,
        this.state.currentVal
      )
    }
  }

  handleNumbers(e) {
    if (this.state.currentVal.indexOf('Limit') == -1) {
      this.setState({
        lastClicked: 'num'
      });
      if (this.state.currentVal.length > 21) {
        this.maxDigitWarning();
      } else if (this.state.lastClicked == 'CE' && this.state.formula !== '') {
        this.setState({
          currentVal:
            !endsWithOperator.test(this.state.formula) ?
            this.state.formula.match(/(-?\d+\.?\d*)$/)[0] + e.target.value : e.target.value,
          formula: this.state.formula += e.target.value
        });
      } else if (this.state.formula.indexOf('=') != -1) {
        this.setState({
          currentVal: e.target.value,
          formula: e.target.value != '0' ? e.target.value : '',
        });
      } else {
        this.setState({
          currentVal: this.state.currentVal == '0' ||
            isOperator.test(this.state.currentVal) ?
            e.target.value : this.state.currentVal + e.target.value,
          formula: this.state.currentVal == '0' && e.target.value == '0' ?
            this.state.formula : /([^.0-9]0)$/.test(this.state.formula) ?
            this.state.formula.slice(0, -1) + e.target.value : this.state.formula + e.target.value,
        });
      }
    }
  }

  handleDecimal() {
    if (this.state.currentVal.indexOf('.') == -1 &&
      this.state.currentVal.indexOf('Limit') == -1) {
      this.setState({
        lastClicked: this.state.lastClicked == 'CE' ? 'CE' : 'decimal'
      })
      if (this.state.currentVal.length > 21) {
        this.maxDigitWarning();
      } else if (this.state.lastClicked == 'evaluated' ||
        endsWithOperator.test(this.state.formula) ||
        this.state.currentVal == '0' && this.state.formula === '' ||
        /-$/.test(this.state.formula)) {
        this.setState({
          currentVal: '0.',
          formula: this.state.lastClicked == 'evaluated' ? '0.' : this.state.formula + '0.'
        });
      } else if (this.state.formula.match(/(\(?\d+\.?\d*)$/)[0].indexOf('.') > -1) {
      } else {
        this.setState({
          currentVal: this.state.formula.match(/(-?\d+\.?\d*)$/)[0] + '.',
          formula: this.state.formula + '.',
        })
      }
    }
  }

  initialize() {
    this.setState({
      currentVal: '0',
      prevVal: '0',
      formula: '',
      currentSign: 'pos',
      lastClicked: ''
    });
  }

  handleCE() {
    let thisWith = new RegExp(/[x+‑\/]$|\d+\.?\d*$|(\(-\d+\.?\d*)$|(\(-)$|\)[x+‑\/]$/);
    if (this.state.formula.indexOf('=') != -1) {
      this.replaceState(this.getInitialState())
    } else {
      this.setState({
        formula: this.state.formula.replace(thisWith, ''),
        currentVal: '0',
        lastClicked: 'CE',
      });
    }
    setTimeout(() => {
      this.setState({
        currentSign: this.state.formula === '' ||
          endsWithOperator.test(this.state.formula) ||
          this.state.formula.match(/(\(?-?\d+\.?\d*)$/)[0].indexOf('-') == -1 ?
          'pos' : 'neg'
      });
    }, 100);
  }

  render() {
    return (
      <div className='calculator'>
        <Formula formula={this.state.formula.replace(/x/g, '⋅')} />
        <Output currentValue={this.state.currentVal}   
 />
        <Buttons onClick={this.handleClick}
          handleEval={this.handleEvaluate}
          handleOperators={this.handleOperators}
          handleToggleSign={this.handleToggleSign}
          handleNumbers={this.handleNumbers}
          handleDecimal={this.handleDecimal}
          handleCE={this.handleCE}
          init={this.initialize}   
 />
      </div>
    )
  }
}


class Buttons extends React.Component {
  render() {
    return (
      <div>
        <button id="clear" value='AC' onClick={this.props.init} style={{ background: '#ac3939' }}>AC</button>
        <button value='CE' onClick={this.props.handleCE} style={{ background: '#ac3939' }}>CE</button>
        <button value='±' onClick={this.props.handleToggleSign} style={{ background: '#666666' }}>±</button>
        <button id="divide" value='/' onClick={this.props.handleOperators} style={{ background: '#666666' }}>/</button>
        <button id="seven" value='7' onClick={this.props.handleNumbers} >7</button>
        <button id="eight" value='8' onClick={this.props.handleNumbers} >8</button>
        <button id="nine" value='9' onClick={this.props.handleNumbers} >9</button>
        <button id="multiply" value='x' onClick={this.props.handleOperators} style={{ background: '#666666' }}>x</button>
        <button id="four" value='4' onClick={this.props.handleNumbers} >4</button>
        <button id="five" value='5' onClick={this.props.handleNumbers} >5</button>
        <button id="six" value='6' onClick={this.props.handleNumbers} >6</button>
        <button id="subtract" value='‑' onClick={this.props.handleOperators} style={{ background: '#666666' }}>-</button>
        <button id="one" value='1' onClick={this.props.handleNumbers} >1</button>
        <button id="two" value='2' onClick={this.props.handleNumbers} >2</button>
        <button id="three" value='3' onClick={this.props.handleNumbers} >3</button>
        <button id="add" value='+' onClick={this.props.handleOperators} style={{ background: '#666666' }}>+</button>
        <button id="zero" value='0' onClick={this.props.handleNumbers} className='zero'>0</button>
        <button id="decimal" value='.' onClick={this.props.handleDecimal} >.</button>
        <button id="equals" value='=' onClick={this.props.handleEval} style={{ background: '#004466' }}>=</button>
      </div>
    );
  }
}

const Output = (props) => {
  return <div id="display" className="outputScreen">{props.currentValue}</div>
};

const Formula = (props) => {
  return <div className="formulaScreen" style={{ minHeight: 20 }}>{props.formula}</div>
};

const Author = () => (
  <div className="author"> Designed and Coded By <br />        
      MAE
  </div>
);

const App = () => (
  <div>
    <Calculator />
    <Author />
  </div>
);

ReactDOM.render(
  <App />,
  document.getElementById('app')
);