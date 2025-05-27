import Head from 'next/head';
import { 
  Box, 
  Container, 
  Typography, 
  Button, 
  Grid, 
  Card, 
  CardContent,
  AppBar,
  Toolbar
} from '@mui/material';
import { Mic, TrendingUp, Psychology } from '@mui/icons-material';

export default function Home() {
  return (
    <>
      <Head>
        <title>English Coaching - スピーキング特化英語学習</title>
        <meta name="description" content="AI英語コーチとシャドーイング自動添削でスピーキング力を向上" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Header */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            English Coaching
          </Typography>
          <Button color="inherit" href="/login">
            ログイン
          </Button>
        </Toolbar>
      </AppBar>

      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'background.paper',
          pt: 8,
          pb: 6,
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            color="text.primary"
            gutterBottom
          >
            AI英語コーチで
            <br />
            スピーキング力を向上
          </Typography>
          <Typography variant="h5" align="center" color="text.secondary" paragraph>
            シャドーイング自動添削とパーソナライズされたAIコーチングで、
            あなたの発音・リズム・表現力を効果的に改善します。
          </Typography>          <Box
            sx={{
              mt: 4,
              display: 'flex',
              justifyContent: 'center',
              gap: 2,
            }}
          >
            <Button 
              variant="contained" 
              size="large"
              href="/practice"
            >
              無料で始める
            </Button>
            <Button variant="outlined" size="large">
              詳細を見る
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container sx={{ py: 8 }} maxWidth="lg">
        <Typography
          component="h2"
          variant="h3"
          align="center"
          color="text.primary"
          gutterBottom
        >
          主要機能
        </Typography>
        <Grid container spacing={4} sx={{ mt: 4 }}>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Mic sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="h3">
                  シャドーイング自動添削
                </Typography>
                <Typography>
                  AI音声分析による発音・リズム・流暢性の即座評価。
                  詳細なフィードバックで効果的な改善をサポート。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <Psychology sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="h3">
                  AI英語コーチ
                </Typography>
                <Typography>
                  GPT-4ベースのパーソナライズドAIコーチが、
                  あなたのレベルと目標に応じた最適な学習プランを提供。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={4}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1, textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography gutterBottom variant="h5" component="h3">
                  進捗追跡
                </Typography>
                <Typography>
                  学習履歴と上達度を可視化。
                  データに基づく詳細な分析で継続的な改善をサポート。
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Footer */}
      <Box sx={{ bgcolor: 'background.paper', p: 6 }} component="footer">
        <Typography variant="h6" align="center" gutterBottom>
          English Coaching
        </Typography>
        <Typography
          variant="subtitle1"
          align="center"
          color="text.secondary"
          component="p"
        >
          AI powered English speaking learning platform
        </Typography>
      </Box>
    </>
  );
}
