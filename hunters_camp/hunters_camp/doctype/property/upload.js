frappe.require("assets/hunters_camp/img.css");
// parent, args, callback
frappe.provide("hc")
hc.upload = {
	make: function(opts) {
		if(!opts.args) opts.args = {};
		var $upload = $(frappe.render_template("upload", {opts:opts})).appendTo(opts.parent);
		var $file_input = $upload.find(".input-upload-file");

		// bind pseudo browse button
		$upload.find(".btn-browse").on("click",
			function() { $file_input.click(); });

		$file_input.on("change", function() {
			if (this.files.length > 0) {
				var $uploaded_file_display = $(repl('<div class="btn-group" role="group">\
					<button type="button" class="btn btn-default btn-sm \
						text-ellipsis uploaded-filename-display">%(filename)s\
					</button>\
					<button type="button" class="btn btn-default btn-sm uploaded-file-remove">\
						&times;</button>\
				</div>', {filename: this.files[0].name}))
				.appendTo($upload.find(".uploaded-filename").removeClass("hidden").empty());

				$uploaded_file_display.find(".uploaded-filename-display").on("click", function() {
					$file_input.click();
				});

				$uploaded_file_display.find(".uploaded-file-remove").on("click", function() {
					$file_input.val("");
					$file_input.trigger("change");
					$('.imageThumb').remove()

				});
				
				var fileobj = $upload.find(":file").get(0).files[0];
				var freader = new FileReader();
				file_data = {}
				freader.onload = function() {
					$("<img></img>",{
	 					class : "imageThumb",
	 					src : freader.result,
	 					title : fileobj.name
	 				}).insertAfter(".file-upload");
	 			};
	 			freader.readAsDataURL(fileobj);

				

			} else {
				$upload.find(".uploaded-filename").addClass("hidden")
			}
		});


		if(!opts.btn) {
			opts.btn = $('<button class="btn btn-default btn-sm">' + __("Attach")
				+ '</div>').appendTo($upload);
		} else {
			$(opts.btn).unbind("click");
		}

		// get the first file
		opts.btn.click(function() {
			// convert functions to values

			if(opts.get_params) {
				opts.args.params = opts.get_params();
			}

			opts.args.file_url = $upload.find('[name="file_url"]').val();

			var fileobj = $upload.find(":file").get(0).files[0];
			hc.upload.upload_file(fileobj, opts.args, opts);
		});
	},
	upload_file: function(fileobj, args, opts) {
		if(!fileobj && !args.file_url) {
			msgprint(__("Please attach a file or set a URL"));
			return;
		}
		// console.log("in upload file")
		// console.log(fileobj)
		// console.log(opts.args)
		// console.log(opts)
		file_data = [] 
		$.each($(cur_dialog.body).find("img"), function(index, data){
			this.file_dict = {}
			this.file_dict["file_data"] = data.src
			this.file_dict["file_ext"] = data.src.split(",")[0].split(":")[1].split(";")[0].split("/")[1];
			this.file_dict["file_name"] = data.title
			file_data.push(this.file_dict) 		
		})
		// console.log(file_data)
		attobj = opts.callback(file_data);
		// var dataurl = null;
		
		// var freader = new FileReader();
		// file_data = {}
		// freader.onload = function() {
		// 	args.filename = fileobj.name;
		// 	file_data["file_name"] = fileobj.name;
		// 	if(opts.options && opts.options.toLowerCase()=="image") {
		// 		console.log(args.filename)
		// 		if(!(/\.(gif|jpg|jpeg|tiff|png|svg)$/i).test(args.filename)) {
		// 			msgprint(__("Only image extensions (.gif, .jpg, .jpeg, .tiff, .png, .svg) allowed"));
		// 			return;
		// 		}
		// 	}
		// 	dataurl = freader.result;
		// 	file_data["file_data"] = freader.result;
		// 	file_data["file_ext"] = freader.result.split(",")[0].split(":")[1].split(";")[0].split("/")[1];
		// 	attobj = opts.callback(file_data);
		// };
		// freader.readAsDataURL(fileobj);
		 
	}
}
