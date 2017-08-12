pragma solidity ^0.4.11;

contract Casino {
   address owner;
   uint public minimumBet = 100 finney; // Equal to 0.1 ether
   uint public totalBet;
   uint public numberOfBets;
   uint public maxAmountOfBets = 100;
   address[] public players;

   struct Player {
      uint amountBet;
      uint numberSelected;
   }

   mapping(address => Player) playerInfo;

   function Casino(uint _minimumBet){
      owner = msg.sender;
      if(_minimumBet != 0) minimumBet = _minimumBet;
   }

   // Fallback function in case someone sends ether to the contract so it doesn't get lost
   function() payable {}

   function kill(){
      if(msg.sender == owner)
         selfdestruct(owner);
   }

   function checkPlayerExists(address player) returns(bool){
      for(uint i = 0; i < players.length; i++){
         if(players[i] == player) return true;
      }
      return false;
   }

   // To bet for a number between 1 and 10 both inclusive
   // To bet for a number between 1 and 10 both inclusive
   function bet(uint number) payable{
      assert(checkPlayerExists(msg.sender) == false);
      assert(number >= 1 && number <= 10);
      assert(msg.value >= minimumBet);

      playerInfo[msg.sender].amountBet = msg.value;
      playerInfo[msg.sender].numberSelected = number;
      numberOfBets += 1;
      players.push(msg.sender);
      totalBet += msg.value;

      if(numberOfBets >= maxAmountOfBets) generateNumberWinner();
   }

   // Generates a number between 1 and 10
   function generateNumberWinner(){
      uint numberGenerated = block.number % 10 + 1; // This isn't secure
      distributePrizes(numberGenerated);
   }

   function distributePrizes(uint numberWinner){
      address[] winners;

      for(uint i = 0; i < players.length; i++){
         address playerAddress = players[i];
         if(playerInfo[playerAddress].numberSelected == numberWinner){
            winners.push(playerAddress);
         }
         delete playerInfo[playerAddress]; // Delete all the players
      }

      players.length = 0; // Delete all the players array

      uint winnerEtherAmount = totalBet / winners.length; // How much each winner gets

      for(uint j = 0; j < winners.length; j++){
         winners[j].transfer(winnerEtherAmount);
      }
   }
}
