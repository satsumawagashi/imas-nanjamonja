enchant();

var PlayerAmount = 8;

// アイドルカード配列
var CardArray = [];
for (var i = 1; i <= 12; i++) {
	CardArray.push('img/card/' + ('00' + i).slice(-3) + '.png');
}

// 1~12の数字が5回ずつランダムに出現する配列
var ShuffleArray = [];
for (var i = 0; i < 5; i++) {
	for (var j = 0; j < 12; j++) {
		ShuffleArray.push(j);
	}
}
function shuffle(){
	for(var i = ShuffleArray.length - 1; i > 0; i--){
	    var r = Math.floor(Math.random() * (i + 1));
	    var tmp = ShuffleArray[i];
	    ShuffleArray[i] = ShuffleArray[r];
	    ShuffleArray[r] = tmp;
	}
}

window.onload = function () {
	var game = new Game(400, 500);  				//画面サイズを400*500にする。（このサイズだとスマホでも快適なのでおススメ）

	//結果ツイート時にURLを貼るため、このゲームのURLをここに記入
	var url = "https://twitter.com/hothukurou";
	url = encodeURI(url); //きちんとURLがツイート画面に反映されるようにエンコードする
	/////////////////////////////////////////////////
	//ゲーム開始前に必要な画像・音を読み込む部分


	//クリック音読み込み
	var ClickSound = "sound/click.wav";						//game.htmlからの相対パス
	game.preload([ClickSound]); 				//データを読み込んでおく

	//アイドルカード画像
	game.preload(CardArray);					//データを読み込んでおく

	//プレイヤーボタン
	var ButtonArray = [];
	for (idx = 0; idx <= PlayerAmount; idx++) {
		// プレイヤー人数+1だけ実行
		ButtonArray.push('img/player/button' + String(idx) + '.png');						//game.htmlからの相対パス
	}
	game.preload(ButtonArray);					//データを読み込んでおく

	//待機時間バー
	var BarImg = "img/bar.png";						//game.htmlからの相対パス
	game.preload([BarImg]);					//データを読み込んでおく

	// スタートボタン
	var B_Start = 'img/start.png';
	game.preload([B_Start]);					//データを読み込んでおく

	//リトライボタン
	var B_Retry = "img/Retry.png";						//game.htmlからの相対パス
	game.preload([B_Retry]);					//データを読み込んでおく

	//ツイートボタン
	var B_Tweet = "img/Tweet.png";						//game.htmlからの相対パス
	game.preload([B_Tweet]);					//データを読み込んでおく

	//読み込み終わり
	/////////////////////////////////////////////////


	game.onload = function () {					//ロードが終わった後にこの関数が呼び出されるので、この関数内にゲームのプログラムを書こう

		/////////////////////////////////////////////////
		//グローバル変数

		var PointArray = new Array(PlayerAmount + 1).fill(0);									//キャリーオーバーと各プレイヤーのポイント

		function resetPoint(){
			for (idx = 0; idx < PlayerAmount + 1; idx++) {
				// プレイヤー人数+1だけ実行
				PointArray[idx] = 0;
			}
		}
		//resetPoint();

		var NamedFlgArray = []									//各カードに一度以上名前がつけられたかどうか
		for (idx = 0; idx < 12; idx++) {
			// 12回実行
			NamedFlgArray.push(0);
		}

		var Round = 0;								//ラウンド

		var State = 0;								//現在のゲーム状態

		//グローバル変数終わり
		/////////////////////////////////////////////////

		// タイトルシーン
		var S_TITLE = new Scene();
		S_TITLE.backgroundColor = "black"; 			//S_ANSWERシーンの背景は黒くした

		// タイトルテキスト
		var TitleText = new Label();
		TitleText.font = "30px Meiryo";				//フォントはメイリオ 20px 変えたかったらググってくれ
		TitleText.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		TitleText.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		TitleText.moveTo(20, 100);						//移動位置指定
		S_TITLE.addChild(TitleText);					//S_ANSWERシーンにこの画像を埋め込む

		TitleText.text = 'アイマスナンジャモンジャ';

		// スタートボタン
		var StartButton = new Sprite(200, 75);
		StartButton.moveTo(100,300);
		StartButton.image = game.assets[B_Start];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_TITLE.addChild(StartButton);
		StartButton.ontouchend = function(){
			State = 1;
		};



		// 待機時間シーン
		var S_WAIT = new Scene();					//シーン作成
		S_WAIT.backgroundColor = "black"; 			//S_ANSWERシーンの背景は黒くした

		// タイムバー
		var Bar = new Sprite(400, 50);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		Bar.moveTo(0, 400);						//ぞう山ボタンの位置
		Bar.image = game.assets[BarImg];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_WAIT.addChild(Bar);					//S_ANSWERにこのぞう山画像を貼り付ける

		// 待機時間テキスト
		var WaitText = new Label();
		WaitText.font = "25px Meiryo";				//フォントはメイリオ 20px 変えたかったらググってくれ
		WaitText.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		WaitText.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		WaitText.moveTo(5, 350);						//移動位置指定
		S_WAIT.addChild(WaitText);					//S_ANSWERシーンにこの画像を埋め込む

		WaitText.text = '5秒後に次のアイドルが出現します';					//テキストに文字表示 Pointは変数なので、ここの数字が増える

		// ポイント表示テキスト
		var ScoreText = new Label(); 					//テキストはLabelクラス
		ScoreText.font = "25px Meiryo";				//フォントはメイリオ 20px 変えたかったらググってくれ
		ScoreText.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		ScoreText.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		ScoreText.moveTo(20, 20);						//移動位置指定
		S_WAIT.addChild(ScoreText);					//S_ANSWERシーンにこの画像を埋め込む

		function getScoreString() {
			var scoreString = '';
			//scoreString += 'ラウンド:' + String(Round + 1) + '<br>';
			//scoreString += '残り山札:' + String(60 - Round) + '枚<br>';
			for (idx = 0; idx < PlayerAmount + 1; idx++) {
				scoreString += (idx == 0) ? 'キャリーオーバー中：' : 'プレイヤー' + String(idx) + '：';
				scoreString += String(PointArray[idx]) + '点<br>';
			}
			return scoreString;
		}

		// 回答シーン
		var S_ANSWER = new Scene();					//シーン作成
		S_ANSWER.backgroundColor = "black"; 			//S_ANSWERシーンの背景は黒くした

		// 回答時挙動
		function answered(idx){
			game.assets[ClickSound].clone().play();		//クリックの音を鳴らす。
			// 得点計算
			if (idx == 0) {
				PointArray[0] = PointArray[0] + 1;
			} else {
				PointArray[idx] += PointArray[0] + 1;
				PointArray[0] = 0;
			}
			// ラウンド+1
			Round += 1;
			// 待機時間初期化へ
			State = 1;
		}

		// アイドルカード
		var Card = new Sprite(280, 350);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		Card.moveTo(60, 0);						//ぞう山ボタンの位置
		//Card.image = game.assets[CardArray[ShuffleArray[Round]]];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_ANSWER.addChild(Card);					//S_ANSWERにこのぞう山画像を貼り付ける

		// 各プレイヤー回答ボタン
		for (var i = 1; i <= PlayerAmount; i++) {
			eval('var Player' + String(i) + 'Button = new Sprite(100, 50);');
			var x = (i - 1) % 4 * 100;
			var y = (i <= 4) ? 350 : 400;
			eval('Player' + String(i) + 'Button.moveTo(' + String(x) + ', ' + String(y) + ');');
			eval('Player' + String(i) + 'Button.image = game.assets[ButtonArray[' + String(i) + ']];')
			eval('S_ANSWER.addChild(Player' + String(i) + 'Button);');
			eval('Player' + String(i) + 'Button.ontouchend = function(){answered(' + String(i) + ');};');
		}

		// キャリーオーバーボタン
		var CarryOverButton = new Sprite(400, 50);
		CarryOverButton.moveTo(0,450);
		CarryOverButton.image = game.assets[ButtonArray[0]];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_ANSWER.addChild(CarryOverButton);
		CarryOverButton.ontouchend = function(){
			answered(0)
		};


		///////////////////////////////////////////////////
		//メインループ　ここに主要な処理をまとめて書こう
		game.onenterframe = function () {
			//ゲームオーバー判定
			if (Round == 60 && State != 99) {						//60枚目の回答が終わったら
				State = 98;
			}

			if (State == 0) {
				// タイトル画面
				shuffle();
				resetPoint();
				game.popScene();					//現在のシーンを外す
				game.pushScene(S_TITLE);				//S_TITLEシーンを読み込ませる
			}
			if (State == 1) {
				// カウントダウン初期化
				game.popScene();					//現在のシーンを外す
				game.pushScene(S_WAIT);				//S_WAITシーンを読み込ませる
				// Barのx座標を指定
				Bar.x = 0;
				// Barのy座標を指定
				Bar.y = 400;
				ScoreText.text = 'ラウンド:' + String(Round + 1) + '<br>残り山札:' + String(60 - Round) + '枚<br>' + getScoreString();					//テキストに文字表示
				Card.image = game.assets[CardArray[ShuffleArray[Round]]];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
				console.log(CardArray[ShuffleArray[Round]]);
				//現在のテキスト表示
				State = 2;							//カウントダウン中に移行
			}
			if (State == 2) {
				// カウントダウン中
				// Barを左に移動
				Bar.x -= 3;
			}
			if (State == 3) {
				// 回答シーン
				game.popScene();					//待機時間シーンを外す
				game.pushScene(S_ANSWER);				//S_ANSWERシーンを読み込ませる
			}
			if (State == 98) {
				// 終了画面初期化
				game.popScene();					//現在のシーンを外す
				game.pushScene(S_END);				//S_ENDシーンを読み込ませる
				S_GameOverText.text = 'ゲーム終了！！！<br>結果発表<br>' + getScoreString() + getResultText();
				console.log(S_GameOverText.text);
				console.log(String(State));
				State = 99;
			}
			if (State == 99) {
				// 終了画面
			}

			// 待機時間終了判定
			if (Bar.x <= -400 && State != 0) {
				Bar.x = 0;
				State = 3
			}
		};



		////////////////////////////////////////////////////////////////
		//結果画面
		S_END = new Scene();
		S_END.backgroundColor = "blue";

		//GAMEOVER
		var S_GameOverText = new Label(); 					//テキストはLabelクラス
		S_GameOverText.font = "30px Meiryo";				//フォントはメイリオ 20px 変えたかったらググってくれ
		S_GameOverText.color = 'rgba(255,255,255,1)';		//色　RGB+透明度　今回は白
		S_GameOverText.width = 400;							//横幅指定　今回画面サイズ400pxなので、width:400pxだと折り返して二行目表示してくれる
		S_GameOverText.moveTo(20, 20);						//移動位置指定
		S_END.addChild(S_GameOverText);						//S_ENDシーンにこの画像を埋め込む

		function getResultText(){
			resultText = '';
			// キャリーオーバーが最小値になる配列作成
			tempArray = PointArray
			tempArray[0] = 0;
			// 最大値取得
			maxPoint = Math.max.apply(null, tempArray);
			// 最大値が０なら空文字を返す
			if(maxPoint == 0) return '';
			// 値が最大値であるindexの配列作成
			maxIndex = [];
			for (var i = 0; i < tempArray.length; i++) {
				if(tempArray[i] == maxPoint)  maxIndex.push(i);
			}
			// 文面作成
			for (var i = 0; i < maxIndex.length; i++) {
				if (maxIndex[i] == 0) continue;
				if (i > 0) resultText += 'と';
				resultText += 'プレイヤー' + String(maxIndex[i]);
			}
			resultText += 'の勝利！！！';
			return resultText;
		}

		//リトライボタン
		var S_Retry = new Sprite(120, 60);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		S_Retry.moveTo(50, 400);						//リトライボタンの位置
		S_Retry.image = game.assets[B_Retry];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_END.addChild(S_Retry);					//S_ENDにこのリトライボタン画像を貼り付ける

		S_Retry.ontouchend = function () {				//S_Retryボタンをタッチした（タッチして離した）時にこの中の内容を実行する
			Round = 0;
			State = 0;
		};

		//ツイートボタン
		var S_Tweet = new Sprite(120, 60);				//画像サイズをここに書く。使う予定の画像サイズはプロパティで見ておくこと
		S_Tweet.moveTo(230, 400);						//リトライボタンの位置
		S_Tweet.image = game.assets[B_Tweet];			//読み込む画像の相対パスを指定。　事前にgame.preloadしてないと呼び出せない
		S_END.addChild(S_Tweet);					//S_ENDにこのリトライボタン画像を貼り付ける

		S_Tweet.ontouchend = function () {				//S_Tweetボタンをタッチした（タッチして離した）時にこの中の内容を実行する
			//ツイートＡＰＩに送信
			window.open("http://twitter.com/intent/tweet?text=アイマスアイドル12人にあだ名をつけたら、そのあだ名を誰よりも早く思い出して叫ぼう！%0d%0aサイトにアクセスするだけで遊べるボードゲーム『アイマスナンジャモンジャ』&hashtags=アイマスナンジャモンジャ&url=" + url); //ハッシュタグにahogeタグ付くようにした。
		};

	};
	game.start();
};
