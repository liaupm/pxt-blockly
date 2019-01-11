'use strict';

goog.provide('Blockly.Constants.Bioblocks');

goog.require('Blockly.Blocks');
goog.require('Blockly.Colours');
goog.require('Blockly.constants');
goog.require('Blockly');

Blockly.defineBlocksWithJsonArray([  // BEGIN JSON EXTRACT
// Block for constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
{
    "type": "pcr",
    "message0": "Create PCR attached to %1",
    "args0": [
      {
        "type": "field_dropdown",
        "name": "PIN",
        "options": [
          ["A0", "A0"],
          ["A1", "A1"],
          ["A2", "A2"],
          ["A3", "A3"],
          ["A4", "A4"],
          ["A5", "A5"],
          ["A6", "A6"],
          ["A7", "A7"],
          ["A8", "A8"],
          ["A9", "A9"],
          ["D0", "D0"],
          ["D1", "D1"],
          ["D2", "D2"],
          ["D3", "D3"],
        ]
      }
    ],
    "output": "Number",
    "colour": "%{BKY_VARIABLES_HUE}",
    "outputShape": Blockly.OUTPUT_SHAPE_ROUND,
    "tooltip": "Generates a pin dropdown",
    "helpUrl": "-"
  },

  // Block for variable setter.
  // {
  //   "type": "create_pcr",
  //   "message0": "Create PCR machine %1 D %3 D %4 A %2",
  //   "args0": [{
  //     "type": "field_variable",
  //     "name": "VAR",
  //     "variable": "pcr_machine"
  //     }, {
  //     "type": "field_dropdown",
  //     "name": "PIN",
  //     "options": [
  //       ["A0", "A0"],
  //       ["A1", "A1"],
  //       ["A2", "A2"],
  //       ["A3", "A3"],
  //       ["A4", "A4"],
  //       ["A5", "A5"],
  //       ["A6", "A6"],
  //       ["A7", "A7"],
  //       ["A8", "A8"],
  //       ["A9", "A9"]
  //     ]
  //   }, {
  //     "type": "field_dropdown",
  //     "name": "PIN",
  //     "options": [
  //       ["D0", "D0"],
  //       ["D1", "D1"],
  //       ["D2", "D2"],
  //       ["D3", "D3"],
  //     ]
  //   }, {
  //     "type": "field_dropdown",
  //     "name": "PIN",
  //     "options": [
  //       ["D0", "D0"],
  //       ["D1", "D1"],
  //       ["D2", "D2"],
  //       ["D3", "D3"],
  //     ]
  //   }],
  //   "previousStatement": null,
  //   "nextStatement": null,
  //   "colour": "%{BKY_VARIABLES_DYNAMIC_HUE}",
  //   "tooltip": "%{BKY_VARIABLES_SET_TOOLTIP}",
  //   "helpUrl": "%{BKY_VARIABLES_SET_HELPURL}"
  // }
]);  // END JSON EXTRACT (Do not delete this comment.)


Blockly.Blocks['new_centrifuge'] = {
  init: function() {
    this.setInputsInline(true); // Horizontal: No (too many inputs)
    this.setPreviousStatement(true); // Can stick to something before (yes)
    this.setNextStatement(true); // Can have a modifier on the bottom (yes)
    this.setColour(120); // Green

    // Title
    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_CENTRE)
      .appendField("CENTRIFUGE")
    this.setTooltip('');

    this.appendDummyInput()
      .setAlign(Blockly.ALIGN_LEFT)
      .appendField("Pin ")
      .appendField(new Blockly.FieldDropdown([
          ["D0", "D0"],
          ["D1", "D1"],
          ["D2", "D2"],
          ["D3", "D3"],
          ["D4", "D4"],
          ["D5", "D5"],
          ["D6", "D6"],
          ["D7", "D7"],
          // ["D8", "D8"]
      ]), "DPIN0")
    this.setTooltip('');

    // this.appendValueInput('IF0')
    // .setCheck('Boolean')
    // .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);

    this.appendValueInput("source")
      .setCheck(["containerCheck", "containerList"])
      .setAlign(Blockly.ALIGN_LEFT)
      .appendField("Container input");

    this.appendValueInput("SPEED")
      .setCheck("Number")
      .appendField("Speed (RPM)");

    // this.appendValueInput("RPM")
    //   .setCheck("Number")
    //   .appendField("RPM");

    this.appendValueInput("DURATION")
      .setCheck("Number")
      .appendField("Duration")
      .appendField(new Blockly.FieldDropdown([["in minutes", "minutes"], ["in milliseconds", "milliseconds"], ["in seconds", "seconds"], ["in hours", "hours"]]), "DURATION_UNIT");

    this.appendValueInput("OPERATION_TIME")
      .setCheck("Number")
      .appendField("Time of operation");

    this.appendValueInput("TEMPERATURE")
      .setCheck("Number")
      .appendField("Temperature")
      .appendField(new Blockly.FieldDropdown([["in Celsius", "celsius"], ["in Kelvin", "kelvin"]]), "TEMPERATURE_UNIT");

  },
};
