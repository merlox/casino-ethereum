import React from 'react'
import ReactDOM from 'react-dom'
import * as log from 'loglevel'
import './../css/index.css'
import JSONInterface from './../json/interface.json'


class App extends React.Component {
   constructor(props) {
      super(props)

      this.state = {
         lastWinner: 0,
         numberOfBets: 0,
         minimumBet: 0,
         totalBet: 0,
         maxAmountOfBets: 0,
      }

      if (window.web3) {
         log.info("Using web3 detected from external source like Metamask")
      } else {
         log.info("No web3 detected. Falling back to http://localhost:8545.")
         log.info("You should remove this fallback when you deploy live, as it's inherently insecure.")
         log.info("Consider switching to Metamask for development. More info here: http://truffleframework.com/tutorials/truffle-and-metamask");
         Web3 = require('web3')
         web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:8545"))
      }

      const address = "0x430d959fa54714aca8eecd61fae2661fca900e04" // Replace with your address
      const MyContract = web3.eth.contract(JSONInterface)
      this.state.ContractInstance = MyContract.at(address)

      window.a = this.state

      this.updateState = this.updateState.bind(this)
      this.voteNumber = this.voteNumber.bind(this)
      this.numbers = this.numbers.bind(this)
   }

   componentDidMount() {
      this.updateState()
      setInterval(this.updateState.bind(this), 7e3)
   }

   updateState() {
      this.state.ContractInstance.minimumBet((err, result) => {
         log.debug('minimumBet result: ', result)
         if (result == null) return
         this.setState({ minimumBet: parseFloat(web3.fromWei(result, 'ether')) })
      })
      this.state.ContractInstance.totalBet((err, result) => {
         log.debug('totalBet result: ', result)
         if (result == null) return
         this.setState({ totalBet: parseFloat(web3.fromWei(result, 'ether')) })
      })
      this.state.ContractInstance.numberOfBets((err, result) => {
         log.debug('numberOfBets result: ', result)
         if (result == null) return
         this.setState({ numberOfBets: parseInt(result) })
      })
      this.state.ContractInstance.maxAmountOfBets((err, result) => {
         log.debug('maxAmountOfBets result: ', result)
         if (result == null) return
         this.setState({ maxAmountOfBets: parseInt(result) })
      })
   }

   voteNumber(number) {
      let bet = this.refs['ether-bet'].value

      if (!bet) bet = 0.1

      if (parseFloat(bet) < this.state.minimumBet) {
         return alert('You must bet more than the minimum')
      }

      this.state.ContractInstance.bet(number, {
         gas: 300000,
         from: web3.eth.accounts[0],
         value: web3.toWei(bet, 'ether')
      }, (err, transactionHash) => {
         if (err) return log.error(err)

         log.info('Transaction hash: ', transactionHash)
         // Log more information for debugging purposes
         if (process.env.NODE_ENV === 'development') {
            web3.eth.getTransaction(transactionHash, (err, transactionDetails) => {
               log.info('Transaction Details: ', transactionDetails)
            })
         }
      })
   }

   numbers() {
      const numbers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
      const listItems = numbers.map(number => (
         <li key={number} onClick={() => this.voteNumber(parseInt(number))}>{number}</li>
      ))
      return (<ul ref="numbers">{listItems}</ul>)
   }

   render() {
      return (
         <div className="main-container">
            <h1>Bet for your best number and win huge amounts of Ether</h1>

            <div className="block">
               <b>Number of bets:</b> &nbsp;
               <span>{this.state.numberOfBets}</span>
            </div>

            <div className="block">
               <b>Last number winner:</b> &nbsp;
               <span>{this.state.lastWinner}</span>
            </div>

            <div className="block">
               <b>Total ether bet:</b> &nbsp;
               <span>{this.state.totalBet} ether</span>
            </div>

            <div className="block">
               <b>Minimum bet:</b> &nbsp;
               <span>{this.state.minimumBet} ether</span>
            </div>

            <div className="block">
               <b>Max amount of bets:</b> &nbsp;
               <span>{this.state.maxAmountOfBets}</span>
            </div>

            <hr/>

            <h2>Vote for the next number</h2>

            <label>
               <b>How much Ether do you want to bet? <input className="bet-input" ref="ether-bet" type="number" placeholder={this.state.minimumBet} /></b> ether
               <br/>
            </label>

            {this.numbers()}

            <hr/>

            <div><i>Only working with the Ropsten Test Network</i></div>
            <div><i>You can only vote once per account</i></div>
            <div><i>Your vote will be reflected when the next block is mined</i></div>
         </div>
      )
   }
}

ReactDOM.render(
   <App />,
   document.querySelector('#root')
)
