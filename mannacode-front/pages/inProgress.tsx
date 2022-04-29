import React, { useEffect, useState } from 'react';
import {
  createStyles,
  FormHelperText,
  Grid, IconButton, Typography, withWidth,
} from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import BasePage from '../components/page/general/BasePage';
// eslint-disable-next-line no-unused-vars
import { GridColDef, GridValueFormatterParams } from '@material-ui/data-grid';
import DataGrid from 'components/style/DataGrid';
import { useAuth } from 'components/context/auth';
import { useRouter } from 'next/router';
import { PathName } from 'components/static/Route';
import palette from 'components/singleton/palette';
import AlertDialogRemove from 'components/style/AlertDialogRemove';
import { getGroupChallengesStatusIsNotEnd } from '@/services/groupChallenges';
import { remove } from '@/services/groupChallenges';

const useStyles = makeStyles((theme) => ({
  div: {
    minHeight: '93vh',
    width: '100%',
    position: 'relative',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  divActivities: {
    borderRadius: 5,
    padding: 0,
    zIndex: 10,
    width: '100%',
    display: 'flex',
    [theme.breakpoints.down('sm')]: {
      width: '65%',
    },
    [theme.breakpoints.down('xs')]: {
      width: '98%',
    },
  },
  textErrorButton: {
    fontSize: '1.5rem',
    color: '#DA1E27',
    fontFamily: 'IBM Plex Sans',
    margin: 0,
    textAlign: 'center',
  },
  textTitleHead: {
    color: '#4c4c4c',
    fontFamily: 'Bahnschrift',
    fontSize: '5.0rem',
    fontWeight: 'bold',
    fontStretch: 'condensed',
    textAlign: 'center'
  },
}));

function InProgress(props) {
  const classes = useStyles();
  const router = useRouter();
  const { width } = props;
  const { signed, token, statusRedirect } = useAuth();
  const [activities, setActivities] = useState<any[]>([]);
  const [messageError, setMessageError] = useState<string>(null);

  const pageSize = Math.floor(((window.innerHeight / 100 * 80) - 108) / 52);
  const widthGeneral = window.innerWidth - 73 - 50;
  const field10 = (widthGeneral / 12) * 10 / 3;
  const field20 = field10 * 2;

  const [page, setPage] = useState({ page: 1, pageSize: pageSize + 1, order: { field: 'createdAt', sort: -1 } });
  const [removed, setRemoved] = useState<boolean>(false);

  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(pageSize + 1);
  const [row, setRow] = useState(null);
  const [openAlertDialog, setOpenAlertDialog] = useState<boolean>(false);
  const [errorAlertDialog, setErrorAlertDialog] = useState<boolean>(false);


  const handleClose = () => {
    setOpenAlertDialog(false);
    setErrorAlertDialog(false);
  };

  const handleRemove = async (value) => {
    if (value === row.title) {
      if (signed) {
        const response = await remove(row.id, token);
        statusRedirect(response.data.code);
        if (response.ok) {
          setRemoved(true);
          router.push(`${PathName.activities}`);
        }
      }

      setOpenAlertDialog(false);
    } else {
      setErrorAlertDialog(true);
    }
  };

  const useStylesTheme = makeStyles(() =>
    createStyles({
      iconItem: {
        color: '#325ab3',
        '& svg': {
          fontSize: '2.5rem'
        },
        '&.active, &:hover, &.active:hover': {
          color: palette.get().primaryText,
        }
      },
    }),
  );
  const classesTheme = useStylesTheme();

  const columns: GridColDef[] = [
    { field: 'title', headerAlign: 'center', align: 'center', headerName: 'Nome', width: width !== 'xs' ? field20 : 150, description: 'Nome da atividade', },
    {
      field: 'createdAt', headerAlign: 'center', align: 'center', type: 'date', headerName: 'Data', width: width !== 'xs' ? field10 : 150, description: 'Ultima atualização',
      /* eslint-disable-next-line react/display-name */
      renderCell: (params: GridValueFormatterParams) => (
        <Grid
          container
          direction="row"
          justify="flex-end"
          alignItems="center"
        >
          <Grid item xs={7} style={{ textAlign: 'end' }}>
            {(params.value as number)}
          </Grid>

          <Grid item xs={5} style={{ textAlign: 'end' }}>
            <IconButton className={classesTheme.iconItem}
              aria-label="more"
              aria-controls="long-menu"
              aria-haspopup="true"
              onClick={() => { setRow(params.row); setOpenAlertDialog(true); }}
            >
              Encerrar
            </IconButton>
          </Grid>
        </Grid>
      ),
    },
  ];

  const handlePageChange = (params) => {
    setPage({ ...page, page: params.page + 1, pageSize: params.pageSize });
  };

  const onSortModelChange = async (value) => {
    let order = value.sortModel[0];
    if (!order?.field) {
      order = { field: 'createdAt', sort: 'desc' }
    }
    const sort = order.sort === 'asc' ? 1 : -1;
    setPage({ ...page, order: { field: order.field, sort: sort } })
  }

  useEffect(() => {
    let active = true;
    if (signed && page) {
      setLoading(true);
      getGroupChallengesStatusIsNotEnd(token)
        .then((response) => {
          if (response.ok) {
            setTotal(1);
            let _activities = [];
            if (response.data.length !== 0) {
              _activities = [{
                id: response.data.id, title: response.data.title, createdAt: new Date(response.data.createdAt).toLocaleString('pt-BR', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                }),
              }];
            }

            if (!active) {
              return;
            }
            setActivities(_activities);
            setLoading(false);
            setMessageError('');
            setRemoved(false);
          } else {
            setMessageError(response.data.message);
          }
        });
    }
  }, [page, signed, removed])
  return (
    BasePage(
      <div lang='pt-br' className={classes.div} style={{ background: palette.get().background }}>
        <Grid
          className={classes.divActivities}
          container
          direction="row"
          justify="space-evenly"
          alignItems="flex-start"
        >
          <Grid item xs={12} sm={10} style={{ background: palette.get().secondaryText }}>
            <Typography className={classes.textTitleHead}>
              Para iniciar outra atividade voce tem que finalizar suas atividades.
            </Typography>
            <FormHelperText className={classes.textErrorButton} {...(messageError && { error: true })}>{messageError || ''}</FormHelperText>
            <div style={{ height: window.innerHeight / 100 * 80, width: '100%' }}>
              <DataGrid onPageChange={handlePageChange} rowCount={total} textNoRowsOverlay={'Não há atividades'} onSortModelChange={onSortModelChange}
                loading={loading} height={window.innerHeight / 100 * 80} rows={activities} columns={columns} pageSize={pageSize} />
            </div>
          </Grid>

        </Grid>
        <AlertDialogRemove  buttonTextAction='Encerrar' error={errorAlertDialog} handleRemove={handleRemove} open={openAlertDialog} title='Encerrar atividade' text='Para encerrar a atividade coloque o nome da atividade e exclua' label='Nome da atividade' handleClose={handleClose}></AlertDialogRemove>
      </div>
    )
  );
}
export default withWidth()(InProgress);