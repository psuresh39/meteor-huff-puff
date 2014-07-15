/************************ Client and Server **********************************/
MeteorFile = function (options) {
  options = options || {};
  this.name = options.name;
  this.type = options.type;
  this.size = options.size;
  this.source = options.source;
};

MeteorFile.fromJSONValue = function (value) {
  return new MeteorFile({
    name: value.name,
    type: value.type,
    size: value.size,
    source: EJSON.fromJSONValue(value.source)
  });
};

MeteorFile.prototype = {
  constructor: MeteorFile,

  typeName: function () {
    return "MeteorFile";
  },

  equals: function (other) {
    return
      this.name == other.name &&
      this.type == other.type &&
      this.size == other.size;
  },

  clone: function () {
    return new MeteorFile({
      name: this.name,
      type: this.type,
      size: this.size,
      source: this.source
    });
  },

  toJSONValue: function () {
    return {
      name: this.name,
      type: this.type,
      size: this.size,
      source: EJSON.toJSONValue(this.source)
    };
  }
};

EJSON.addType("MeteorFile", MeteorFile.fromJSONValue);

if (Meteor.isClient) {

    _.extend(MeteorFile.prototype, {
    read: function (file, callback) {
      var reader = new FileReader;
      var meteorFile = this;

      callback = callback || function () {};

      reader.onload = function () {
        meteorFile.source = new Uint8Array(reader.result);
        callback(null, meteorFile);
      };

      reader.onerror = function () {
        callback(reader.error);
      };

      reader.readAsArrayBuffer(file);
    }
  });

  _.extend(MeteorFile, {
    read: function (file, callback) {
      return new MeteorFile(file).read(file, callback);
    }
  });  

Template.fileupload_page.uploaded_files = function () {
	return FileUser.find({}, {sort: {name: 1}});
  };

Template.fileupload_page.events({
    "click input.upload": function (e, tmpl) {
      e.preventDefault();

      // Grab the file input control so we can get access to the
      // selected files
      var fileInput = tmpl.find('input[type=file]');

      // Grab the form so we can reset it after a successful upload
      var form = e.currentTarget;

      // We'll assign each file in the loop to this variable
      var file;

      for (var i = 0; i < fileInput.files.length; i++) {

        file = fileInput.files[i];
        
        // Read the file into memory
        MeteorFile.read(file, function (err, meteorFile) {
        
          // Make a Meteor method call passing a meteorFile
          Meteor.call("uploadFile", meteorFile, function (err) {
            if (err)
              throw err;
            else
              form.reset();
          });
        });
      }
    },
  
	'click input.logout': function () {
	Meteor.logout()
   }
  });



}

/************************ Server *********************************************/
if (Meteor.isServer) {
  var fs = Npm.require('fs');
  var path = Npm.require('path');
  _.extend(MeteorFile.prototype, {
    save: function (dirPath, options) {
      var filepath = path.join(dirPath, this.name);
      var buffer = new Buffer(this.source);
      fs.writeFileSync(filepath, buffer, options);
    }
  });
  Meteor.methods({
    uploadFile: function (file) {
      console.log("SAVING FILE");
      //file.save("/home/pranay/Documents",{});
      console.log()
      console.log("FILE SAVED in /home/pranay/Documents...WAITING FOR REQUESTS");
    }
  });
}
/*****************************************************************************/
