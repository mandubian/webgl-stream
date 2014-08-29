(function(){
  this.Log = {
    info: function(msg, prefix) {
      console.log && console.log( (prefix || "") + msg );
    },

    warn: function(msg, prefix) {
      if (console.warn) console.warn( (prefix || "WARN ") + msg );
      else log( (prefix || "WARN ") + msg );
    },

    error: function(msg, prefix) {
      if (console.error) console.error( (prefix || "WARN ") + msg );
      else log( (prefix || "ERR ") + msg);s
    },

    debug: function(msg, prefix) {
      if (console.debug) console.debug( (prefix || "DBG ") + msg );
      else log( (prefix || "DBG ") + msg);
    }
  }
})();