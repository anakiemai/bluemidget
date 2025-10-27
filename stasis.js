// rooms/stasis.js
game.rooms.stasis = {
  desc: "*******************************************************************<br><br>You are inside a stasis pod. The walls glow faintly blue.\n" +
        "Frost clings to the glass. A screen reads: <b>\"3 YEARS REMAINING\"</b>\n" +
        "A single button blinks: <b>EMERGENCY RELEASE</b>.",
  
  exits: {},
  items: [],
  
  // Optional: custom actions
  onEnter: function() {
    // Already shown in dialogue.js — keep empty or add flavor
  }
};