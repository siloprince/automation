// global
let g_videoEnabled = false;
let canvas;
let mx, my, gl, run;
let startTime;
let time = 0.0;
let tempTime = 0.0;
let FPS = 1000 / 30;
let uniLocation = [];
// カウンタの宣言
let count = 0;
let texture0 = null, texture1 = null;
let index;
let texture2 = null;
let video;

(function(console,document,window){
// onload
window.addEventListener('load', function () {
	// canvas エレメントを取得
	canvas = document.querySelector('canvas#canvas');
	let c  = canvas;
	let cw, ch;
	// canvas サイズ調整
	for (let si=8;si<14;si++){
		let less = Math.pow(2,si);
		if (c.width <= less) {
			cw = less; 
			break;
		}
	}
	for (let si=8;si<14;si++){
		let less = Math.pow(2,si);
		if (c.height <= less) {
			ch = less;
			break; 
		}
	}
	if (c.width > Math.pow(2,13)){
		cw = Math.pow(2,13);
	}
	if (c.height > Math.pow(2,13)){
		ch = Math.pow(2,13);
	}
	c.width = cw;
	c.height = ch;

	canWebcam();

	// イベントリスナー登録
	c.addEventListener('mousemove', mouseMove, true);

	// WebGL コンテキストを取得
	gl = c.getContext('webgl') || c.getContext('experimental-webgl');

	// シェーダ周りの初期化
	var prg = create_program(create_shader('vs'), create_shader('fs'));
	run = (prg != null);

	uniLocation.push(gl.getUniformLocation(prg, 'time'));
	uniLocation.push(gl.getUniformLocation(prg, 'mouse'));
	uniLocation.push(gl.getUniformLocation(prg, 'resolution'));
	uniLocation.push(gl.getUniformLocation(prg, 'texture0'));
	uniLocation.push(gl.getUniformLocation(prg, 'texture1'));
	uniLocation.push(gl.getUniformLocation(prg, 'texture2'));

	// attributeLocationを配列に取得
	var attLocation = new Array();
	attLocation[0] = gl.getAttribLocation(prg, 'position');
	attLocation[1] = gl.getAttribLocation(prg, 'color');
	attLocation[2] = gl.getAttribLocation(prg, 'textureCoord');

	// attributeの要素数を配列に格納
	var attStride = new Array();
	attStride[0] = 3;
	attStride[1] = 4;
	attStride[2] = 2;

	// 頂点データ回りの初期化
	var position = [
		-1.0, 1.0, 0.0,
		1.0, 1.0, 0.0,
		-1.0, -1.0, 0.0,
		1.0, -1.0, 0.0
	];

	// 頂点色
	var color = [
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0,
		1.0, 1.0, 1.0, 1.0
	];

	// テクスチャ座標
	var textureCoord = [
		0.0, 0.0,
		1.0, 0.0,
		0.0, 1.0,
		1.0, 1.0
	];

	// 頂点インデックス
	index = [
		0, 2, 1,
		1, 2, 3
	];

	// VBOとIBOの生成
	var vPosition = create_vbo(position);
	var vColor = create_vbo(color);
	var vTextureCoord = create_vbo(textureCoord);
	var VBOList = [vPosition, vColor, vTextureCoord];
	var iIndex = create_ibo(index);

	// VBOとIBOの登録
	set_attribute(VBOList, attLocation, attStride);
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iIndex);

	// 深度テストを有効にする
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);

	// テクスチャ用変数の宣言と生成
	create_texture('texture0.png', 0);
	create_texture('texture1.png', 1);

	// その他の初期化
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	mx = 0.5; my = 0.5;
	startTime = new Date().getTime();

	// レンダリング関数呼出
	render();
});
// mouse
function mouseMove(e) {
	mx = e.offsetX / canvas.width;
	my = e.offsetY / canvas.height;
}
// 恒常ループ
function render(flag) {

	// フラグチェック
	if (!run) { return; }

	// 時間管理
	time = (new Date().getTime() - startTime) * 0.001;
	// canvasを初期化
	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.clearDepth(1.0);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

	// カウンタを元にラジアンを算出
	count++;
	var rad = (count % 360) * Math.PI / 180;

	// テクスチャユニットを指定してバインドし登録する
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, texture0);
	gl.uniform1i(uniLocation[3], 0);

	// テクスチャユニットを指定してバインドし登録する
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, texture1);
	gl.uniform1i(uniLocation[4], 1);


	// テクスチャユニットを指定してバインドし登録する
	if (g_videoEnabled) {
		gl.activeTexture(gl.TEXTURE2);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
		gl.bindTexture(gl.TEXTURE_2D, texture2);
		gl.uniform1i(uniLocation[5], 2);
	}

	// テクスチャを更新する
	// uniform変数の登録と描画
	gl.uniform1f(uniLocation[0], time + tempTime);
	gl.uniform2fv(uniLocation[1], [mx*canvas.width, my*canvas.height]);
	gl.uniform2fv(uniLocation[2], [canvas.width, canvas.height]);
	gl.drawElements(gl.TRIANGLES, index.length, gl.UNSIGNED_SHORT, 0);

	// コンテキストの再描画
	gl.flush();

	// 再帰
	if (!flag) {
		setTimeout(render, FPS);
	}
}

// シェーダを生成する関数
function create_shader(id) {
	// シェーダを格納する変数
	var shader;

	// HTMLからscriptタグへの参照を取得
	let scriptElement = document.querySelector('script#'+id);
	let scriptText = '';
	// scriptタグが存在しない場合は抜ける
	if (!scriptElement) {
		if (id!=='vs') {
			return;
		} else {
			shader = gl.createShader(gl.VERTEX_SHADER);
			scriptText = `
        attribute vec3 position;
        void main(void){
            gl_Position   = vec4(position, 1.0);
        }`;
		}
	} else {
		// scriptタグのtype属性をチェック
		if (scriptElement.type==='x-shader/x-vertex') {
			shader = gl.createShader(gl.VERTEX_SHADER);
			scriptText = scriptElement.text;
		} else if (scriptElement.type==='x-shader/x-fragment') {
			shader = gl.createShader(gl.FRAGMENT_SHADER);	
			scriptText = `precision mediump float;
			`+ scriptElement.text;
		} else {
			return;
		}
	}

	// 生成されたシェーダにソースを割り当てる
	gl.shaderSource(shader, scriptText);

	// シェーダをコンパイルする
	gl.compileShader(shader);

	// シェーダが正しくコンパイルされたかチェック
	if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {

		// 成功していたらシェーダを返して終了
		return shader;
	} else {

		// 失敗していたらエラーログをアラートする
		alert(gl.getShaderInfoLog(shader));
	}
}

// プログラムオブジェクトを生成しシェーダをリンクする関数
function create_program(vs, fs) {
	// プログラムオブジェクトの生成
	var program = gl.createProgram();

	// プログラムオブジェクトにシェーダを割り当てる
	gl.attachShader(program, vs);
	gl.attachShader(program, fs);

	// シェーダをリンク
	gl.linkProgram(program);

	// シェーダのリンクが正しく行なわれたかチェック
	if (gl.getProgramParameter(program, gl.LINK_STATUS)) {

		// 成功していたらプログラムオブジェクトを有効にする
		gl.useProgram(program);

		// プログラムオブジェクトを返して終了
		return program;
	} else {

		// 失敗していたらエラーログをアラートする
		alert(gl.getProgramInfoLog(program));
	}
}

// VBOを生成する関数
function create_vbo(data) {
	// バッファオブジェクトの生成
	var vbo = gl.createBuffer();

	// バッファをバインドする
	gl.bindBuffer(gl.ARRAY_BUFFER, vbo);

	// バッファにデータをセット
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);

	// バッファのバインドを無効化
	gl.bindBuffer(gl.ARRAY_BUFFER, null);

	// 生成した VBO を返して終了
	return vbo;
}

// VBOをバインドし登録する関数
function set_attribute(vbo, attL, attS) {
	// 引数として受け取った配列を処理する
	for (var i in vbo) {
		// バッファをバインドする
		gl.bindBuffer(gl.ARRAY_BUFFER, vbo[i]);

		// attributeLocationを有効にする
		gl.enableVertexAttribArray(attL[i]);

		// attributeLocationを通知し登録する
		gl.vertexAttribPointer(attL[i], attS[i], gl.FLOAT, false, 0, 0);
	}
}

// IBOを生成する関数
function create_ibo(data) {
	// バッファオブジェクトの生成
	var ibo = gl.createBuffer();

	// バッファをバインドする
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ibo);

	// バッファにデータをセット
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Int16Array(data), gl.STATIC_DRAW);

	// バッファのバインドを無効化
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, null);

	// 生成したIBOを返して終了
	return ibo;
}

// テクスチャを生成する関数
function create_texture(source, number) {
	// イメージオブジェクトの生成
	var img = new Image();

	// データのオンロードをトリガーにする
	img.onload = function () {
		// テクスチャオブジェクトの生成
		var tex = gl.createTexture();

		// テクスチャをバインドする
		gl.bindTexture(gl.TEXTURE_2D, tex);

		// テクスチャへイメージを適用
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);

		// ミップマップを生成
		gl.generateMipmap(gl.TEXTURE_2D);

		// テクスチャのバインドを無効化
		gl.bindTexture(gl.TEXTURE_2D, null);

		// 生成したテクスチャを変数に代入
		switch (number) {
			case 0:
				texture0 = tex;
				break;
			case 1:
				texture1 = tex;
				break;
			default:
				break;
		}
	};

	// イメージオブジェクトのソースを指定
	img.src = source;
}


// ウェブカメラが利用できるかをチェックする
function canWebcam() {
	if (!g_videoEnabled) {
		return;
	}
	// ベンダープリフィックスを考慮して初期化
	navigator.getUserMedia = (
		navigator.getUserMedia ||
		navigator.webkitGetUserMedia ||
		navigator.mozGetUserMedia
	);

	if (navigator.getUserMedia) {
		// user media に対する設定
		navigator.getUserMedia(
			// 有効化する user media
			{
				video: true,
				audio: false
			},

			// usre media の取得に成功した場合
			function (localMediaStream) {
				var url = (
					window.URL ||
					window.webkitURL
				);

				// video エレメントの生成
				video = document.createElement('video');
				// video エレメントにイベントを設定
				video.addEventListener('canplay', function () {
					// 複数回呼ばれないようにイベントを削除
					video.removeEventListener('canplay', arguments.callee, true);
					// video 再生開始をコール
					video.play();
					// テクスチャオブジェクトの生成
					texture2 = gl.createTexture(gl.TEXTURE_2D);

					// テクスチャをバインドする
					gl.activeTexture(gl.TEXTURE2);
					gl.bindTexture(gl.TEXTURE_2D, texture2);

					// テクスチャへイメージを適用
					gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);

					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
					gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

					// レンダリング関数を呼ぶ
					render(true);
				}, true);
				// video エレメントのソースにウェブカメラを渡す
				video.src = url.createObjectURL(localMediaStream);
			},

			// user media の取得に失敗した場合
			function (err) {
				// 取得に失敗した原因を調査
				if (err.name === 'PermissionDeniedError') {
					// ユーザーによる利用の拒否
					alert('denied permission');
				} else {
					// デバイスが見つからない場合など
					alert('can not be used webcam');
				}
			}
		);
	} else {
		// ブラウザがサポートしていない
		alert('not supported getUserMedia');
	}
}

})(console,document,window);