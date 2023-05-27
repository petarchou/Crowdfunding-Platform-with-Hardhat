// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.8.18;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./CrowdfundingProject.sol";

contract CrowdfundingPlatform {

    address immutable projectImplementation;

    address[] public projects;

    constructor(address _projectImplementation) {
        projectImplementation = _projectImplementation;
    }

    function createProject(
        string memory name,
        string memory _description,
        uint256 fundingGoal,
        uint256 duration
    ) external {
        bytes32 salt = bytes32(abi.encodePacked(name, _description, fundingGoal, duration));
        address proj = address(Clones.cloneDeterministic(projectImplementation, salt));
        CrowdfundingProject(proj).initialize(name, _description, fundingGoal, duration, msg.sender);
        projects.push(proj);
    }

}