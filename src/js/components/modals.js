/*
Plugin: Immerse.js
Component: Modals
Description: Adds a modal window to any Immerse section
Version: 1.0.0
Author: Will Viles
Author URI: http://vil.es/
*/

$.Immerse.registerComponent({
  name: 'modals',
  hasSectionObject: true,

  // Initialize function
  init: function(opts) {

    this.imm = opts.immerse;
    this.modalWrapper = this.imm.utils.namespacify.call(this.imm, 'modal-wrapper');
    this.modalId = this.imm.utils.namespacify.call(this.imm, 'modal-id');
    this.modalIdDataTag = this.imm.utils.datatagify.call(this.imm, this.modalId);
    this.modalOpen = this.imm.utils.namespacify.call(this.imm, 'modal-open');
    this.modalOpenDataTag = this.imm.utils.datatagify.call(this.imm, this.modalOpen);

    var section = opts.section,
        $section = $(section.element),
        pluginName = this.name,
        that = this;

    // Prepare modal sections
    $.each($section.find(this.modalIdDataTag), function(i, modal) {
      var id = $(this).data(that.modalId),
          niceId = $.camelCase(id),
          userSettings, extendedSettings,
          modalDefaults = {
            element: $(this),
            onConfirm: 'close', onCancel: 'close', onEscape: 'close', onOutsideClick: 'close'
          };

      // If no user settings defined, just add our modal defaults
      if (!section.components[pluginName].hasOwnProperty(niceId)) {
        section.components[pluginName][niceId] = modalDefaults;
      // However, if user has specified in section setup, extend settings over the defaults
      } else {
        userSettings = section.components[pluginName][niceId];
        extendedSettings = $.extend({}, modalDefaults, userSettings);
        section.components[pluginName][niceId] = extendedSettings;
      }
      // Wrap section
      that.wrap.call(that, this, id);
    });

    // Open buttons
    $section.find(this.modalOpenDataTag).on('click', function(i, modalBtn) {
      var modalId = $(this).data(that.modalOpen);
      that.actions.open.call(that, modalId);
    });

    // Namespacify modal action
    this.modalAction = this.imm.utils.namespacify.call(this.imm, 'modal-action');

    // get all .imm-modal-close, .imm-modal-cancel, .imm-modal-confirm buttons
    var allActions = ['close', 'cancel', 'confirm'],
        allButtons = [];

    $.each(allActions, function(i, name) {
      var niceName = name.charAt(0).toUpperCase() + name.slice(1);
      that['modal' + niceName + 'DataTag'] = that.imm.utils.datatagify.call(that.imm, that.modalAction, name);
      allButtons.push(that['modal' + niceName + 'DataTag']);
    });

    // On modal button clicks
    $section.find(allButtons.toString()).on('click', function(i, modalBtn) {

      var action = $(this).data(that.modalAction),
          actionNiceName = action.charAt(0).toUpperCase() + action.slice(1),
          modal = $(this).closest(that.modalIdDataTag),
          id = modal.data(that.modalId),
          niceId = $.camelCase(id),
          shouldClose = true;

      $(section.components.modals[niceId].element).trigger(action);

      var actionObj = section.components[pluginName][niceId]['on' + actionNiceName];

      if (actionObj === 'close') {
        that.actions.close.call(that, modal, id);
      } else if ($.isFunction(actionObj)) {
        actionObj(modal, id);
      }

    });

    return this;
  },

  wrap: function(modal, id) {
    $(modal).wrap('<div class="' + this.modalWrapper + '"></div>');
  },

  actions: {

    open: function(id) {
      var modal = this.imm.utils.datatagify.call(this.imm, this.modalId, id);
      $(modal).closest('.' + this.modalWrapper).addClass('opened');
    },

    close: function(modal, id) {
      $(modal).closest('.' + this.modalWrapper).removeClass('opened');
    }

  }

});