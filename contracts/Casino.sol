pragma solidity ^0.4.11;

contract Casino {
   address owner;
   uint public minimumBet = 100 finney; // Equal to 0.1 ether
   uint public totalBet;
   uint public numberOfBets;
   uint public maxAmountOfBets = 2;
   uint public numberWinner;
   address[] public players;

   struct Player {
      uint amountBet;
      uint numberSelected;
   }

   mapping(address => Player) playerInfo;

   function Casino(uint _minimumBet, uint _maxAmountOfBets){
      owner = msg.sender;
      if(_minimumBet != 0) minimumBet = _minimumBet;
      if(_maxAmountOfBets != 0) maxAmountOfBets = _maxAmountOfBets;
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
      numberWinner = block.number % 10 + 1; // This isn't secure
      distributePrizes();
   }

   // Sends the corresponding ether to each winner depending on the total bets
   function distributePrizes(){
      address[100] memory winners; // We have to create a temporary in memory array with fixed size
      uint count = 0; // This is the count for the array of winners

      for(uint i = 0; i < players.length; i++){
         address playerAddress = players[i];
         if(playerInfo[playerAddress].numberSelected == numberWinner){
            winners[count] = playerAddress;
            count++;
         }
         delete playerInfo[playerAddress]; // Delete all the players
      }

      uint winnerEtherAmount = totalBet / winners.length; // How much each winner gets

      for(uint j = 0; j < count; j++){
         if(winners[j] != address(0)) // Check that the address in this fixed array is not empty
         winners[j].transfer(winnerEtherAmount);
      }

      resetData();
   }

   function resetData(){
      players.length = 0; // Delete all the players array
      totalBet = 0;
      numberOfBets = 0;
   }
}
