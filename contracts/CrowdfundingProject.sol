// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts-upgradeable/token/ERC20/ERC20Upgradeable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CrowdfundingProject is ERC20Upgradeable, Ownable {

    string public description;
    uint256 public endDate;
    bool public goalReached = false;
    bool private fundingWithdrawn = false;
    address[] private _tokenHolders;
    mapping(address => uint256) public royalties;
    uint256 public contributedAmount;

    function initialize(string memory name,
    string memory _description,
    uint256 fundingGoal,
    uint256 duration,
    address _owner
    ) initializer external {
        __ERC20_init(name, deriveAbbreviation(name));
        _mint(address(this), fundingGoal * 10 ** decimals());
        _transferOwnership(_owner);
        description = _description;
        endDate = block.timestamp + duration;
        contributedAmount = 0;
    }

    // constructor(
    //     string memory name,
    //     string memory _description,
    //     uint256 fundingGoal,
    //     uint256 duration,
    //     address _owner
    // ) ERC20(name, deriveAbbreviation(name)) {
    //     _mint(address(this), fundingGoal * 10 ** decimals());
    //     _transferOwnership(_owner);
    //     description = _description;
    //     endDate = block.timestamp + duration;
    // }

    error InvalidContributionAmount();
    error CrowdfundingInProgress();
    error CrowdfundingOver();
    error CrowdfundingUnsuccessful();
    error CrowdfundingSuccessful();

    /**
     * Reverts if after end date or if funding goal was reached.
     */
    modifier projectOngoing() {
        if (block.timestamp >= endDate || goalReached) {
            revert CrowdfundingOver();
        }
        _;
    }

    /**
     * Reverts if before end date AND funding goal not reached.
     */
    modifier projectOver() {
        if (block.timestamp < endDate && !goalReached) {
            revert CrowdfundingInProgress();
        }
        _;
    }

    /**
     * Reverts if the contribution goal was NOT reached.
     * Does NOT check if project is Over or still Ongoing.
     */
    modifier projectSuccessful() {
        if (!goalReached) {
            revert CrowdfundingUnsuccessful();
        }
        _;
    }

    /**
     * Reverts if the contribution goal WAS reached.
     * Does NOT check if project is Over or still Ongoing.
     */
    modifier projectUnsuccessful() {
        if (goalReached) {
            revert CrowdfundingSuccessful();
        }
        _;
    }

    /**
     * Users call this function to contribute ethers to the project.
     * 1 wei = 1 share
     *
     * Unavailable after end date or if funding goal was reached.
     */
    function contribute() external payable projectOngoing {
        uint256 maxPossibleContribution = totalSupply() - contributedAmount;
        if (msg.value == 0 || msg.value > maxPossibleContribution) {
            revert InvalidContributionAmount();
        }
        contributedAmount += msg.value;

        _transfer(address(this), msg.sender, msg.value);
        

        if(!_containsHolder(msg.sender)) {
            _tokenHolders.push(msg.sender);
        }

        if (msg.value == maxPossibleContribution) {
            goalReached = true;
        }
    }

    /**
     * Allows contributors to collect back their funds if crowdfunding is unsuccessful
     */
    function refund() external projectOver projectUnsuccessful {
        uint256 toRefund = balanceOf(msg.sender);
        require(toRefund > 0, "Nothing to refund");

        _transfer(msg.sender, address(this), toRefund);
        (bool success, ) = msg.sender.call{value: toRefund}("");
        if (success) {
            this;
        }
    }

    /**
     * Allows the owner of the project to withdraw all funds if crowdfunding was successful.
     */
    function receiveFunding() external onlyOwner projectOver projectSuccessful {
        require(!fundingWithdrawn, "Funding was already withdrawn.");

        (bool success, ) = msg.sender.call{value: address(this).balance}("");
        if (success) {
            //State is changed after the call operation because if owner somehow can't receive funds, he can transfer ownership to someone who can.
            //Also the whole balance is being sent so there is nothing left to steal.
            fundingWithdrawn = true;
            this;
        }
    }

    function withdrawRoyalties() external projectOver projectSuccessful {
        uint256 toWithdraw = royalties[msg.sender];
        require(toWithdraw > 0, "Nothing to withdraw");

        royalties[msg.sender] = 0;
        (bool success, ) = msg.sender.call{value: toWithdraw}("");
        if (success) {
            this;
        }
    }

    /**
     * Allows owner to add royalties which get distribtued to all contributers.
     * Royalties can be withdrawn via getRoyalties().
     */
    function addRoyalties()
        external
        payable
        onlyOwner
        projectOver
        projectSuccessful
    {
        //Math here is not perfect for very small amounts of ether
        for (uint i = 0; i < _tokenHolders.length; ++i) {
            uint256 royaltiesToAward = msg.value * balanceOf(holder) / totalSupply();
            
            royalties[_tokenHolders[i]] += royaltiesToAward;
        }
    }

    /**
     * Private function to derive the symbol of the project from its name.
     * !VERY BASIC!
     *
     * @param name name of the project
     */
    function deriveAbbreviation(
        string memory name
    ) private pure returns (string memory) {
        bytes memory nameBytes = bytes(name);
        require(nameBytes.length > 2, "Name must be atleast 3 characters long");

        bytes memory abbreviation = new bytes(3);

        for (uint i = 0; i < 3; ++i) {
            abbreviation[i] = nameBytes[i];
        }

        return string(abbreviation);
    }

    /**
     * Checks if target address is contained in the _tokenHolders array.
     * 
     * @return bool
     */
    function _containsHolder(address target) private view returns (bool) {
             (uint256 i = 0; i < _tokenHolders.length; ++i) {
            if (_tokenHolders[i] == target) {
                return true;
            }
        }
        return false;
    }

    function _msgSender() internal view override(Context, ContextUpgradeable) returns (address) {
        return msg.sender;
    }

 function _msgData() internal view override(Context, ContextUpgradeable) returns (bytes calldata) {
        return msg.data;
    }

}
